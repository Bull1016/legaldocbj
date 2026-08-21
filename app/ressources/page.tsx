import { db } from "@/lib/db"
import { resourceArticle } from "@/lib/db/schema"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Calendar, ArrowRight, Tag } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function RessourcesPage() {
  let dbArticles: Array<typeof resourceArticle.$inferSelect> = []
  try {
    dbArticles = await db.select().from(resourceArticle)
  } catch (e) {
    dbArticles = []
  }

  const sampleArticles = dbArticles.length > 0 ? dbArticles : [
    {
      id: 1,
      title: "Comment créer sa SARL au Bénin en 2026 : Le Guide Complet",
      slug: "guide-creation-sarl-benin",
      category: "Guides Pratiques",
      summary: "Découvrez toutes les étapes, pièces à fournir et délais pour immatriculer votre société commerciale au guichet unique de l'APIEX.",
      createdAt: new Date(),
    },
    {
      id: 2,
      title: "Comprendre la Taxe Professionnelle Synthétique (TPS)",
      slug: "comprendre-tps-fiscalite-benin",
      category: "Fiscalité",
      summary: "Qui est assujetti à la TPS au Bénin ? Quels sont les taux applicables et les échéances de déclaration ?",
      createdAt: new Date(),
    },
    {
      id: 3,
      title: "Droit OHADA : Les obligations annuelles des gérants de SARL",
      slug: "obligations-annuelles-gerants-sarl-ohada",
      category: "Droit OHADA",
      summary: "Approbation des comptes, assemblée générale ordinaire (AGO) et dépôt du bilan au RCCM : ce que la loi exige.",
      createdAt: new Date(),
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold mb-3">
            <BookOpen className="w-4 h-4 text-purple-600" /> Centre de Ressources & Guides Juridiques
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Actualités & Guides Juridiques au Bénin</h1>
          <p className="text-slate-600 mt-2 text-sm">
            Retrouvez nos fiches pratiques, conseils fiscaux et décryptages de la réglementation OHADA pour gérer votre entreprise en toute sérénité.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sampleArticles.map((art) => (
            <Card key={art.id} className="border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow flex flex-col justify-between">
              <CardHeader className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-bold flex items-center gap-1">
                    <Tag className="w-3 h-3" /> {art.category}
                  </span>
                </div>
                <CardTitle className="text-base font-bold text-slate-900 leading-snug line-clamp-2">{art.title}</CardTitle>
                <CardDescription className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {art.summary}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {new Date(art.createdAt).toLocaleDateString("fr-FR")}
                </span>
                <span className="text-emerald-600 font-bold hover:underline flex items-center gap-1 cursor-pointer">
                  Lire la suite <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
