import { db } from "@/lib/db"
import { company } from "@/lib/db/schema"
import { requireUser } from "@/lib/session"
import { eq } from "drizzle-orm"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Calendar, Plus, ShieldAlert } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function MonEntreprisePage() {
  const user = await requireUser()
  let companiesList: Array<typeof company.$inferSelect> = []
  try {
    companiesList = await db.select().from(company).where(eq(company.userId, user.id))
  } catch (e) {
    companiesList = []
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Espace Mon Entreprise</h1>
            <p className="text-slate-600 text-sm mt-1">
              Gérez votre dossier juridique numérique, suivez vos formalités et anticipez vos obligations fiscales & sociales.
            </p>
          </div>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2">
            <Link href="/dashboard/nouvelle-demande">
              <Plus className="w-4 h-4" /> Nouvelle Entreprise / Formalité
            </Link>
          </Button>
        </div>

        {companiesList.length === 0 ? (
          <Card className="border-dashed border-2 border-slate-300 p-12 text-center bg-white">
            <Building2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800">Aucune entreprise enregistrée</h2>
            <p className="text-slate-600 text-sm max-w-md mx-auto mt-2 mb-6">
              Vous n'avez pas encore créé ou immatriculé d'entreprise sur LegalDoc BJ. LANCEZ-VOUS EN QUELQUES CLICS !
            </p>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Link href="/quiz-forme-juridique">Créer mon entreprise maintenant</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" /> Mes Structures Enregistrées
              </h2>
              {companiesList.map((c) => (
                <Card key={c.id} className="border-slate-200 shadow-sm bg-white">
                  <CardHeader className="bg-slate-900 text-white rounded-t-xl py-4 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold">{c.name}</CardTitle>
                      <CardDescription className="text-slate-300 text-xs mt-0.5">
                        Forme : <span className="text-emerald-400 font-semibold">{c.legalForm}</span> | Siège : {c.city}, {c.country}
                      </CardDescription>
                    </div>
                    <span className={`px-3 py-1 border text-xs font-semibold rounded-full ${
                      c.status === "active"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : c.status === "dissolved"
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    }`}>
                      {c.status === "active" ? "Immatriculée" : c.status === "dissolved" ? "Dissoute" : "En cours de création"}
                    </span>
                  </CardHeader>
                  <CardContent className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <p className="text-slate-500 font-medium">N° RCCM</p>
                      <p className="font-bold text-slate-800 mt-1">{c.rccm || "En cours..."}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">N° IFU</p>
                      <p className="font-bold text-slate-800 mt-1">{c.ifu || "En cours..."}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">Capital Social</p>
                      <p className="font-bold text-slate-800 mt-1">{(c.capital || 0).toLocaleString()} FCFA</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">Actions</p>
                      <Link href="/dashboard/demandes" className="text-emerald-600 font-bold hover:underline block mt-1">
                        Gérer les actes &rarr;
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Calendar of Obligations */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-600" /> Calendrier des Obligations
              </h2>
              <Card className="border-slate-200 shadow-sm bg-white">
                <CardHeader className="p-4 border-b">
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-slate-800">
                    <ShieldAlert className="w-4 h-4 text-amber-600" /> Échéances à venir
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3 text-xs">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="font-bold text-blue-900">Cotisations Sociales CNSS</p>
                    <p className="text-blue-700 mt-0.5">Échéance : 15 du mois prochain</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="font-bold text-slate-900">Approbation des Comptes Annuels (AGO)</p>
                    <p className="text-slate-600 mt-0.5">Échéance : Avant le 30 Juin</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
