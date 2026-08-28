"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, ShieldCheck, Zap, Building, Crown, Loader2 } from "lucide-react"
import { createSubscriptionPaymentAction } from "@/app/actions/subscription"

const PLANS = [
  {
    id: "starter",
    name: "Pack Confort",
    icon: ShieldCheck,
    price: "15 000 FCFA",
    period: "/ mois",
    description: "Pour les petites entreprises et indépendants souhaitant sécuriser leur secrétariat juridique de base.",
    features: [
      "Secrétariat juridique annuel (Rédaction AGO/PV)",
      "Accès illimité à la bibliothèque de modèles d'actes",
      "1 consultation juridique par mois incluse",
      "Rappels et suivi du calendrier des obligations fiscales",
    ],
    highlight: false,
  },
  {
    id: "pro",
    name: "Pack Sérénité Pro",
    icon: Zap,
    price: "35 000 FCFA",
    period: "/ mois",
    description: "L'accompagnement complet pour PME gérant leurs formalités et modifications récurrentes.",
    features: [
      "Tout le contenu du Pack Confort",
      "Formalités de modifications illimitées (Gérant, adresse)",
      "Consultations juridiques illimitées avec un juriste dédié",
      "Diagnostic juridique et fiscal annuel offert",
      "Support prioritaire sous 4h ouvrées",
    ],
    highlight: true,
  },
  {
    id: "enterprise",
    name: "Sur-Mesure / Corporate",
    icon: Crown,
    price: "Sur devis",
    period: "",
    description: "Solutions dédiées pour filiales, groupes de sociétés et structures à fort volume d'actes.",
    features: [
      "Secrétariat juridique multi-sociétés",
      "Conformité APDP & protection des données",
      "Audits juridiques approfondis",
      "Juriste dédié sur site ou à distance",
    ],
    highlight: false,
  },
]

export default function AbonnementsSolutionsPage() {
  const router = useRouter()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState("")

  async function handleSubscribe(planId: string) {
    if (planId === "enterprise") {
      router.push("/conseil-juridique")
      return
    }

    setLoadingPlan(planId)
    setErrorMsg("")

    try {
      const res = await createSubscriptionPaymentAction(planId)
      if (res.success && res.paymentUrl) {
        router.push(res.paymentUrl)
      } else {
        setErrorMsg((res as any).error || "Impossible de démarrer le paiement d'abonnement.")
      }
    } catch (err: any) {
      if (err?.message?.includes("Non autorisé") || err?.message?.includes("UNAUTHORIZED")) {
        router.push("/sign-in?redirect=/abonnements")
      } else {
        setErrorMsg(err?.message || "Une erreur est survenue lors de la souscription.")
      }
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-semibold mb-3">
            <Building className="w-4 h-4 text-amber-700" /> Abonnements Solutions Entreprises
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Externalisez votre Secrétariat Juridique</h1>
          <p className="text-slate-600 mt-2 text-sm">
            Un juriste dédié et une plateforme complète en abonnement mensuel pour assurer la conformité juridique et fiscale permanente de votre entreprise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((p) => {
            const IconComp = p.icon
            return (
              <Card
                key={p.id}
                className={`flex flex-col justify-between transition-all relative border ${
                  p.highlight
                    ? "border-emerald-600 shadow-lg ring-2 ring-emerald-600 bg-white"
                    : "border-slate-200 bg-white shadow-sm"
                }`}
              >
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                    Recommandé
                  </div>
                )}
                <div>
                  <CardHeader className="p-6 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-3 text-slate-800">
                      <IconComp className="w-5 h-5 text-emerald-600" />
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-900">{p.name}</CardTitle>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900">{p.price}</span>
                      <span className="text-xs font-medium text-slate-500">{p.period}</span>
                    </div>
                    <CardDescription className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {p.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-3 text-xs">
                    <p className="font-bold text-slate-900 mb-1">Inclus dans cette offre :</p>
                    {p.features.map((f, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-slate-700 leading-tight">{f}</span>
                      </div>
                    ))}
                  </CardContent>
                </div>
                <CardFooter className="p-6 pt-0">
                  <Button
                    onClick={() => handleSubscribe(p.id)}
                    disabled={loadingPlan === p.id}
                    className={`w-full font-bold py-5 rounded-xl ${
                      p.highlight
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-slate-900 hover:bg-slate-800 text-white"
                    }`}
                  >
                    {loadingPlan === p.id ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : p.id === "enterprise" ? (
                      "Demander un devis"
                    ) : (
                      `Souscrire au ${p.name}`
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}
