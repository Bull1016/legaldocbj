"use server"

import { db } from "@/lib/db"
import { subscription, company } from "@/lib/db/schema"
import { requireUser } from "@/lib/session"
import { createFedaPayTransaction } from "@/lib/fedapay"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

const PLAN_PRICES: Record<string, number> = {
  starter: 15000,
  pro: 35000,
}

export async function createSubscriptionPaymentAction(planId: string) {
  const user = await requireUser()

  const price = PLAN_PRICES[planId]
  if (!price) {
    throw new Error("Plan d'abonnement invalide ou sur devis.")
  }

  let [userCompany] = await db
    .select()
    .from(company)
    .where(eq(company.userId, user.id))
    .limit(1)

  if (!userCompany) {
    [userCompany] = await db
      .insert(company)
      .values({
        userId: user.id,
        name: `Entreprise de ${user.name}`,
        legalForm: "SARL",
        status: "active",
      })
      .returning()
  }

  const [createdSub] = await db
    .insert(subscription)
    .values({
      companyId: userCompany.id,
      userId: user.id,
      plan: planId,
      status: "pending",
      price,
    })
    .returning()

  const result = await createFedaPayTransaction({
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    subscriptionId: createdSub.id,
    amount: price,
    description: `Abonnement LegalDoc BJ - Plan ${planId.toUpperCase()}`,
  })

  revalidatePath("/dashboard")
  return result
}
