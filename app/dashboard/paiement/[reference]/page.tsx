import { db } from "@/lib/db"
import { payment, request, documentType } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { notFound, redirect } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { processPaymentSuccess } from "@/lib/fedapay"
import { CheckCircle2, CreditCard, Smartphone } from "lucide-react"

export default async function PaymentCheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ reference: string }>
  searchParams: Promise<{ simulated?: string }>
}) {
  const { reference } = await params
  const { simulated } = await searchParams

  const [payRecord] = await db.select().from(payment).where(eq(payment.reference, reference))

  if (!payRecord) {
    notFound()
  }

  let reqDetails = null
  let docTypeDetails = null

  if (payRecord.requestId) {
    const [req] = await db.select().from(request).where(eq(request.id, payRecord.requestId))
    reqDetails = req
    if (req) {
      const [doc] = await db.select().from(documentType).where(eq(documentType.id, req.documentTypeId))
      docTypeDetails = doc
    }
  }

  async function handleSimulateSuccess() {
    "use server"
    await processPaymentSuccess({
      reference,
      transactionId: `SIM-${Date.now()}`,
      mode: "MTN Mobile Money Sandbox",
    })
    redirect(`/dashboard/demandes/${payRecord?.requestId || ""}`)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-xl">
        <Card className="shadow-lg border-slate-200">
          <CardHeader className="bg-slate-900 text-white rounded-t-xl py-6">
            <CardTitle className="text-xl flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" /> Guichet de Paiement FedaPay
            </CardTitle>
            <CardDescription className="text-slate-300">
              Référence transaction : <span className="font-mono text-emerald-300">{reference}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="bg-slate-100 p-4 rounded-lg flex justify-between items-center border border-slate-200">
              <div>
                <p className="text-sm text-slate-600 font-medium">Service / Demande</p>
                <p className="font-semibold text-slate-900">{docTypeDetails?.name || "Prestation LegalDoc BJ"}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600 font-medium">Montant à payer</p>
                <p className="text-2xl font-bold text-emerald-600">{payRecord.amount.toLocaleString()} XOF</p>
              </div>
            </div>

            {payRecord.status === "approved" ? (
              <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-bold text-emerald-900">Paiement déjà confirmé !</h3>
                <p className="text-sm text-emerald-700">Votre démarche est en cours de traitement par nos agents.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-medium text-slate-800 text-sm">Sélectionnez le mode de paiement (Sandbox FedaPay) :</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 border rounded-xl border-emerald-500 bg-emerald-50/50 flex flex-col items-center justify-center gap-2 text-center cursor-pointer">
                    <Smartphone className="w-6 h-6 text-emerald-600" />
                    <span className="text-xs font-semibold text-slate-800">Mobile Money (MTN / Moov)</span>
                  </div>
                  <div className="p-4 border rounded-xl border-slate-200 flex flex-col items-center justify-center gap-2 text-center opacity-70">
                    <CreditCard className="w-6 h-6 text-slate-600" />
                    <span className="text-xs font-semibold text-slate-800">Carte Visa / Mastercard</span>
                  </div>
                </div>

                <form action={handleSimulateSuccess} className="pt-4">
                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-6 text-base rounded-xl shadow-md">
                    Payer {payRecord.amount.toLocaleString()} XOF maintenant (Sandbox)
                  </Button>
                </form>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-slate-50 border-t p-4 rounded-b-xl justify-center text-xs text-slate-500">
            Paiement 100% sécurisé et chiffré porté par FedaPay BJ
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
