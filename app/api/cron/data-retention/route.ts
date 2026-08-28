import { del } from "@vercel/blob"
import {
  and,
  eq,
  gte,
  inArray,
  isNull,
  lte,
  notLike,
} from "drizzle-orm"
import { NextResponse } from "next/server"
import { createAuditLog } from "@/lib/audit"
import { db } from "@/lib/db"
import {
  account,
  payment,
  request,
  requestValue,
  session,
  twoFactor,
  user,
  verification,
} from "@/lib/db/schema"

const BATCH_SIZE = 500

function yearsAgo(years: number) {
  const date = new Date()
  date.setUTCFullYear(date.getUTCFullYear() - years)
  return date
}

export async function GET(incomingRequest: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET non configuré" }, { status: 503 })
  }
  if (incomingRequest.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const documentCutoff = yearsAgo(5)
  const accountCutoff = yearsAgo(3)
  const paymentCutoff = yearsAgo(10)

  const expiredValues = await db
    .select({ id: requestValue.id, fileUrl: requestValue.fileUrl })
    .from(requestValue)
    .innerJoin(request, eq(request.id, requestValue.requestId))
    .where(and(
      lte(request.updatedAt, documentCutoff),
      inArray(request.status, ["completed", "rejected"]),
      eq(request.legalHold, false)
    ))
    .limit(BATCH_SIZE)

  const removableValueIds: number[] = []
  for (const value of expiredValues) {
    try {
      if (value.fileUrl) await del(value.fileUrl)
      removableValueIds.push(value.id)
    } catch (error) {
      console.error(`Failed to delete retained blob for request value ${value.id}:`, error)
    }
  }
  if (removableValueIds.length > 0) {
    await db.delete(requestValue).where(inArray(requestValue.id, removableValueIds))
  }

  const inactiveUsers = await db
    .selectDistinct({ id: user.id, email: user.email })
    .from(user)
    .leftJoin(
      session,
      and(eq(session.userId, user.id), gte(session.updatedAt, accountCutoff))
    )
    .where(and(
      lte(user.updatedAt, accountCutoff),
      isNull(session.id),
      notLike(user.email, "anonymized-%@invalid.local")
    ))
    .limit(BATCH_SIZE)

  for (const inactiveUser of inactiveUsers) {
    await db.transaction(async (tx) => {
      await tx.delete(account).where(eq(account.userId, inactiveUser.id))
      await tx.delete(session).where(eq(session.userId, inactiveUser.id))
      await tx.delete(twoFactor).where(eq(twoFactor.userId, inactiveUser.id))
      await tx.delete(verification).where(eq(verification.identifier, inactiveUser.email))
      await tx
        .update(user)
        .set({
          name: "Compte anonymisé",
          email: `anonymized-${crypto.randomUUID()}@invalid.local`,
          image: null,
          role: "client",
          twoFactorEnabled: false,
          twoFactorSecret: null,
          updatedAt: new Date(),
        })
        .where(eq(user.id, inactiveUser.id))
    })
  }

  const expiredPayments = await db
    .select({ id: payment.id })
    .from(payment)
    .where(and(lte(payment.updatedAt, paymentCutoff), eq(payment.legalHold, false)))
    .limit(BATCH_SIZE)

  if (expiredPayments.length > 0) {
    await db.delete(payment).where(inArray(payment.id, expiredPayments.map(({ id }) => id)))
  }

  await createAuditLog({
    actorId: "system:data-retention",
    actorName: "Tâche de conservation",
    actorRole: "system",
    action: "DATA_RETENTION_COMPLETED",
    entityType: "retention_job",
    details: {
      requestValuesDeleted: removableValueIds.length,
      accountsAnonymized: inactiveUsers.length,
      paymentsDeleted: expiredPayments.length,
    },
  })

  return NextResponse.json({
    requestValuesDeleted: removableValueIds.length,
    accountsAnonymized: inactiveUsers.length,
    paymentsDeleted: expiredPayments.length,
  })
}
