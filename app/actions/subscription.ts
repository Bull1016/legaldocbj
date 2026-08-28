"use server"

import { db } from "@/lib/db"
import { subscription, company } from "@/lib/db/schema"
import { getSessionUser } from "@/lib/session"
import { createFedaPayTransaction, getFedaPayConfig } from "@/lib/fedapay"
import { and, eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

const PLAN_PRICES: Record<string, number> = {
  starter: 15000,
  pro: 35000,
}

export async function createSubscriptionPaymentAction(planId: string) {
  const user = await getSessionUser()
  if (!user) {
    return { success: false as const, code: "unauthorized" as const }
  }

  const price = PLAN_PRICES[planId]
  if (!price) {
    return {
      success: false as const,
      code: "invalid_plan" as const,
      error: "Plan d'abonnement invalide ou sur devis.",
    }
  }

  // Validate configuration before any persistence or external request.
  getFedaPayConfig()

  const result = await db.transaction(async (tx) => {
    // Serialize company/subscription creation for this user across instances.
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`subscription:${user.id}`}))`)

    let [userCompany] = await tx
      .select()
      .from(company)
      .where(eq(company.userId, user.id))
      .limit(1)

    if (!userCompany) {
      [userCompany] = await tx
        .insert(company)
        .values({
          userId: user.id,
          name: `Entreprise de ${user.name}`,
          legalForm: "SARL",
          status: "active",
        })
        .returning()
    }

    let [pendingSubscription] = await tx
      .select()
      .from(subscription)
      .where(and(eq(subscription.companyId, userCompany.id), eq(subscription.status, "pending")))
      .limit(1)

    if (!pendingSubscription) {
      [pendingSubscription] = await tx
        .insert(subscription)
        .values({
          companyId: userCompany.id,
          userId: user.id,
          plan: planId,
          status: "pending",
          price,
        })
        .returning()
    }

    return createFedaPayTransaction({
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      subscriptionId: pendingSubscription.id,
      amount: pendingSubscription.price,
      description: `Abonnement LegalDoc BJ - Plan ${pendingSubscription.plan.toUpperCase()}`,
    }, tx)
  })

  revalidatePath("/dashboard")
  return result.success ? result : { ...result, code: "payment_error" as const }
}
