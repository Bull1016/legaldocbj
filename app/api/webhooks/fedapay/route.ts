import { NextResponse } from "next/server"
import { processPaymentSuccess } from "@/lib/fedapay"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // FedaPay webhook payload standard structure
    const event = body.event || body.type
    const transaction = body.entity || body.data?.transaction || body.transaction

    if (event === "transaction.approved" || event === "transaction.created" && transaction?.status === "approved") {
      const reference = transaction.custom_metadata?.paymentReference || transaction.reference
      const transactionId = String(transaction.id)
      const mode = transaction.mode || transaction.payment_method?.name

      if (reference) {
        await processPaymentSuccess({
          reference,
          transactionId,
          mode,
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook FedaPay Error:", error)
    return NextResponse.json({ error: "Webhook error" }, { status: 400 })
  }
}
