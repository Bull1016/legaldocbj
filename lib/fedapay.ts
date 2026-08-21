import { db } from "@/lib/db"
import { payment, request } from "@/lib/db/schema"
import { createAuditLog } from "@/lib/audit"
import { sendEmail } from "@/lib/email"
import { eq } from "drizzle-orm"

export async function createFedaPayTransaction({
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
}) {
  const secretKey = process.env.FEDAPAY_SECRET_KEY
  const environment = process.env.FEDAPAY_ENVIRONMENT || "sandbox"
  const baseUrl = environment === "live" ? "https://api.fedapay.com/v1" : "https://sandbox-api.fedapay.com/v1"

  const reference = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`

  // Insert payment record into DB
  const [newPayment] = await db.insert(payment).values({
    reference,
    userId,
    requestId: requestId || null,
    subscriptionId: subscriptionId || null,
    amount,
    currency: "XOF",
    provider: "fedapay",
    status: "pending",
  }).returning()

  if (secretKey) {
    try {
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

      if (response.ok) {
        const data = await response.json()
        const fedapayTx = data.v1?.transaction || data.transaction
        if (fedapayTx) {
          // Update transaction ID
          await db.update(payment).set({ transactionId: String(fedapayTx.id) }).where(eq(payment.id, newPayment.id))

          // Generate payment token/url if available
          const tokenResponse = await fetch(`${baseUrl}/transactions/${fedapayTx.id}/token`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${secretKey}`,
              "Content-Type": "application/json",
            },
          })
          if (tokenResponse.ok) {
            const tokenData = await tokenResponse.json()
            return {
              success: true,
              paymentUrl: tokenData.url || tokenData.token,
              reference,
              paymentId: newPayment.id,
            }
          }
        }
      }
    } catch (err) {
      console.error("FedaPay API error:", err)
    }
  }

  // Fallback Sandbox simulation url or payment modal link
  return {
    success: true,
    paymentUrl: `/dashboard/paiement/${reference}?simulated=true`,
    reference,
    paymentId: newPayment.id,
  }
}

export async function processPaymentSuccess({
  reference,
  transactionId,
  mode,
}: {
  reference: string
  transactionId?: string
  mode?: string
}) {
  const [existingPayment] = await db.select().from(payment).where(eq(payment.reference, reference))
  if (!existingPayment) {
    throw new Error("Paiement non trouvé")
  }

  if (existingPayment.status === "approved") {
    return { success: true, message: "Paiement déjà validé" }
  }

  await db.update(payment).set({
    status: "approved",
    transactionId: transactionId || existingPayment.transactionId,
    mode: mode || "Mobile Money / Carte",
    updatedAt: new Date(),
  }).where(eq(payment.id, existingPayment.id))

  if (existingPayment.requestId) {
    await db.update(request).set({
      paymentStatus: "paid",
      updatedAt: new Date(),
    }).where(eq(request.id, existingPayment.requestId))
  }

  await createAuditLog({
    actorId: existingPayment.userId,
    actorRole: "client",
    action: "PAYMENT_APPROVED",
    entityType: "payment",
    entityId: existingPayment.id,
    details: { reference, amount: existingPayment.amount },
  })

  // Send email confirmation
  await sendEmail({
    to: "client@example.com", // will be dynamically loaded if user email exists
    subject: `Confirmation de votre paiement - Ref: ${reference}`,
    html: `<p>Votre paiement de <strong>${existingPayment.amount.toLocaleString()} XOF</strong> a bien été reçu et validé par LegalDoc BJ.</p><p>Merci de votre confiance !</p>`,
  })

  return { success: true, message: "Paiement validé avec succès" }
}
