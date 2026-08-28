import { NextResponse } from "next/server"
import { processPaymentSuccess } from "@/lib/fedapay"
import { db } from "@/lib/db"
import { payment } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { Webhook } from "fedapay"

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get("x-fedapay-signature")
    const webhookSecret = process.env.FEDAPAY_WEBHOOK_SECRET

    if (!signature || !webhookSecret) {
      return NextResponse.json({ error: "Signature manquante ou non configurée" }, { status: 401 })
    }

    let parsedEvent: any
    try {
      parsedEvent = Webhook.constructEvent(rawBody, signature, webhookSecret)
    } catch (sigErr) {
      console.error("Signature webhook FedaPay invalide:", sigErr)
      return NextResponse.json({ error: "Signature invalide" }, { status: 401 })
    }

    const body = typeof parsedEvent === "object" ? parsedEvent : JSON.parse(rawBody)

    // FedaPay webhook payload standard structure
    const eventType = body.event || body.type
    const transaction = body.entity || body.data?.transaction || body.transaction

    if (!transaction) {
      return NextResponse.json({ received: true })
    }

    const isApprovedEvent = eventType === "transaction.approved"
    const isApprovedCreatedEvent = eventType === "transaction.created" && transaction.status === "approved"

    if (isApprovedEvent || isApprovedCreatedEvent) {
      const reference = transaction.custom_metadata?.paymentReference || transaction.reference
      const transactionId = transaction.id ? String(transaction.id) : undefined
      const mode = transaction.mode || transaction.payment_method?.name
      const providerAmount = Number(transaction.amount)
      const providerCurrency = transaction.currency?.iso || "XOF"

      if (reference) {
        const [storedPayment] = await db.select().from(payment).where(eq(payment.reference, reference))
        if (!storedPayment) {
          return NextResponse.json({ error: "Paiement introuvable" }, { status: 404 })
        }

        if (storedPayment.amount !== providerAmount || storedPayment.currency !== providerCurrency) {
          return NextResponse.json({ error: "Incohérence du montant ou de la devise" }, { status: 400 })
        }

        await processPaymentSuccess({
          reference,
          transactionId,
          mode,
          amount: providerAmount,
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook FedaPay Error:", error)
    return NextResponse.json({ error: "Webhook error" }, { status: 400 })
  }
}
