import { db } from "@/lib/db"
import { payment, request, subscription, user } from "@/lib/db/schema"
import { createAuditLog } from "@/lib/audit"
import { sendEmail } from "@/lib/email"
import { eq, and, desc, ne } from "drizzle-orm"

type DatabaseClient = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0]

export function getFedaPayConfig() {
  const environment = process.env.FEDAPAY_ENVIRONMENT
  if (environment !== "sandbox" && environment !== "live") {
    throw new Error('FEDAPAY_ENVIRONMENT doit être défini sur "sandbox" ou "live"')
  }

  const secretKey = process.env.FEDAPAY_SECRET_KEY?.trim()
  if (environment === "live" && !secretKey) {
    throw new Error("FEDAPAY_SECRET_KEY manquant en environnement de production")
  }

  return {
    environment,
    secretKey,
    baseUrl: environment === "live" ? "https://api.fedapay.com/v1" : "https://sandbox-api.fedapay.com/v1",
  }
}

export async function createFedaPayTransaction(
  {
    userId,
    userEmail,
    userName,
    requestId,
    subscriptionId,
    amount,
    description,
  }: {
    userId: string
    userEmail: string
    userName: string
    requestId?: number
    subscriptionId?: number
    amount: number // in XOF
    description: string
  },
  database: DatabaseClient = db
) {
  const { environment, secretKey, baseUrl } = getFedaPayConfig()

  const [existingPayment] = subscriptionId
    ? await database
        .select()
        .from(payment)
        .where(and(eq(payment.subscriptionId, subscriptionId), eq(payment.status, "pending")))
        .orderBy(desc(payment.createdAt))
        .limit(1)
    : []

  if (existingPayment?.paymentUrl) {
    return {
      success: true as const,
      paymentUrl: existingPayment.paymentUrl,
      reference: existingPayment.reference,
      paymentId: existingPayment.id,
    }
  }

  // A prior request may have reached FedaPay even if its response was lost.
  // Keep the local pending record for reconciliation instead of creating a
  // second external transaction with an uncertain outcome.
  if (existingPayment && !existingPayment.transactionId) {
    return {
      success: false as const,
      error: "La transaction FedaPay est en cours d'initialisation.",
    }
  }

  const reference = existingPayment?.reference ?? `PAY-${crypto.randomUUID()}`
  const [newPayment] = existingPayment
    ? [existingPayment]
    : await database
        .insert(payment)
        .values({
          reference,
          userId,
          requestId: requestId || null,
          subscriptionId: subscriptionId || null,
          amount,
          currency: "XOF",
          provider: "fedapay",
          status: "pending",
        })
        .returning()

  async function savePaymentUrl(paymentUrl: string) {
    await database
      .update(payment)
      .set({ paymentUrl, updatedAt: new Date() })
      .where(eq(payment.id, newPayment.id))
    return {
      success: true as const,
      paymentUrl,
      reference,
      paymentId: newPayment.id,
    }
  }

  async function markCreationFailed(error: string) {
    await database
      .update(payment)
      .set({ status: "declined", updatedAt: new Date() })
      .where(eq(payment.id, newPayment.id))
    if (subscriptionId) {
      await database
        .update(subscription)
        .set({ status: "canceled" })
        .where(eq(subscription.id, subscriptionId))
    }
    return { success: false as const, error }
  }

  if (secretKey) {
    let transactionId = newPayment.transactionId
    try {
      if (!transactionId) {
        const response = await fetch(`${baseUrl}/transactions`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${secretKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            description,
            amount,
            currency: { iso: "XOF" },
            merchant_reference: reference,
            callback_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/webhooks/fedapay`,
            customer: {
              email: userEmail,
              firstname: userName.split(" ")[0] || userName,
              lastname: userName.split(" ")[1] || "Client",
            },
            custom_metadata: {
              paymentReference: reference,
              requestId,
              subscriptionId,
            },
          }),
        })

        if (!response.ok) {
          if (response.status >= 500) {
            return { success: false as const, error: "FedaPay est temporairement indisponible" }
          }
          return markCreationFailed("Échec de la création de la transaction FedaPay")
        }

        const data = await response.json()
        const fedapayTx = data.v1?.transaction || data.transaction
        if (!fedapayTx?.id) {
          return { success: false as const, error: "Réponse de création FedaPay invalide" }
        }
        transactionId = String(fedapayTx.id)
        await database
          .update(payment)
          .set({ transactionId, updatedAt: new Date() })
          .where(eq(payment.id, newPayment.id))
      }

      const tokenResponse = await fetch(`${baseUrl}/transactions/${transactionId}/token`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
      })
      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json()
        const paymentUrl = tokenData.url || tokenData.token
        if (paymentUrl) return savePaymentUrl(paymentUrl)
      }

      return {
        success: false as const,
        error: "Transaction FedaPay créée, mais lien de paiement indisponible",
      }
    } catch (err) {
      console.error("FedaPay API error:", err)
      if (!transactionId) {
        return { success: false as const, error: "Erreur réseau FedaPay" }
      }
      return { success: false as const, error: "Erreur réseau FedaPay" }
    }
  }

  // Fallback Sandbox simulation url or payment modal link
  if (environment === "sandbox") {
    return savePaymentUrl(`/dashboard/paiement/${reference}?simulated=true`)
  }

  return markCreationFailed("Configuration FedaPay invalide")
}

export async function processPaymentSuccess({
  reference,
  transactionId,
  mode,
  amount,
}: {
  reference: string
  transactionId?: string
  mode?: string
  amount?: number
}) {
  const [existingPayment] = await db.select().from(payment).where(eq(payment.reference, reference))
  if (!existingPayment) {
    throw new Error("Paiement non trouvé")
  }

  if (amount !== undefined && amount !== existingPayment.amount) {
    throw new Error("Le montant du paiement ne correspond pas")
  }

  // Atomically update only if status is not 'approved'
  const updatedRows = await db
    .update(payment)
    .set({
      status: "approved",
      transactionId: transactionId || existingPayment.transactionId,
      mode: mode || "Mobile Money / Carte",
      updatedAt: new Date(),
    })
    .where(and(eq(payment.reference, reference), ne(payment.status, "approved")))
    .returning()

  async function activateSubscription() {
    if (existingPayment.subscriptionId) {
      await db
        .update(subscription)
        .set({ status: "active", startDate: new Date() })
        .where(eq(subscription.id, existingPayment.subscriptionId))
    }
  }

  if (updatedRows.length === 0) {
    await activateSubscription()
    return { success: true, message: "Paiement déjà validé" }
  }

  if (existingPayment.requestId) {
    await db.update(request).set({
      paymentStatus: "paid",
      updatedAt: new Date(),
    }).where(eq(request.id, existingPayment.requestId))
  }

  await activateSubscription()

  await createAuditLog({
    actorId: existingPayment.userId,
    actorRole: "client",
    action: "PAYMENT_APPROVED",
    entityType: "payment",
    entityId: existingPayment.id,
    details: { reference, amount: existingPayment.amount },
  })

  // Load actual user email
  const [userRecord] = await db.select().from(user).where(eq(user.id, existingPayment.userId))
  if (userRecord && userRecord.email) {
    await sendEmail({
      to: userRecord.email,
      subject: `Confirmation de votre paiement - Ref: ${reference}`,
      html: `<p>Votre paiement de <strong>${existingPayment.amount.toLocaleString()} XOF</strong> a bien été reçu et validé par LegalDoc BJ.</p><p>Merci de votre confiance !</p>`,
    })
  }

  return { success: true, message: "Paiement validé avec succès" }
}
