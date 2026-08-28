import { db } from "@/lib/db"
import { resourceArticle } from "@/lib/db/schema"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { eq, and } from "drizzle-orm"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, Tag } from "lucide-react"

export const dynamic = "force-dynamic"

const FALLBACK_ARTICLES: Record<string, {
  title: string
  category: string
  summary: string
  content: string
  createdAt: Date
}> = {
  "guide-creation-sarl-benin": {
    title: "Comment créer sa SARL au Bénin en 2026 : Le Guide Complet",
    category: "Guides Pratiques",
    summary: "Découvrez toutes les étapes, pièces à fournir et délais pour immatriculer votre société commerciale au guichet unique de l'APIEX.",
    content: `
      <h2>1. Choix du nom et vérification de la disponibilité</h2>
      <p>Avant d'immatriculer votre SARL au Bénin, vous devez choisir une dénomination sociale disponible auprès de l'APIEX.</p>

      <h2>2. Constitution du capital social</h2>
      <p>Au Bénin, le capital social minimum d'une SARL n'est plus fixe par un montant élevé obligatoire, mais il est recommandé d'avoir un capital adapté aux besoins de votre activité.</p>

      <h2>3. Dépôt du dossier à l'APIEX</h2>
      <p>Fournissez les pièces d'identité des associés, les statuts signés, ainsi que le formulaire d'immatriculation unique.</p>
    `,
    createdAt: new Date(),
  },
  "comprendre-tps-fiscalite-benin": {
    title: "Comprendre la Taxe Professionnelle Synthétique (TPS)",
    category: "Fiscalité",
    summary: "Qui est assujetti à la TPS au Bénin ? Quels sont les taux applicables et les échéances de déclaration ?",
    content: `
      <h2>1. Champ d'application de la TPS</h2>
      <p>La Taxe Professionnelle Synthétique s'applique aux petites entreprises dont le chiffre d'affaires annuel est inférieur à 50 000 000 FCFA.</p>

      <h2>2. Modalités et calcul</h2>
      <p>Elle remplace plusieurs impôts (impôt sur les bénéfices, taxe professionnelle, etc.) en un paiement unique et simplifié.</p>
    `,
    createdAt: new Date(),
  },
  "obligations-annuelles-gerants-sarl-ohada": {
    title: "Droit OHADA : Les obligations annuelles des gérants de SARL",
    category: "Droit OHADA",
    summary: "Approbation des comptes, assemblée générale ordinaire (AGO) et dépôt du bilan au RCCM : ce que la loi exige.",
    content: `
      <h2>1. Tenue de l'Assemblée Générale Ordinaire (AGO)</h2>
      <p>Dans les 6 mois suivant la clôture de l'exercice comptable, le gérant doit convoquer les associés pour approuver les comptes de la société.</p>

      <h2>2. Dépôt des états financiers au greffe du RCCM</h2>
      <p>Le procès-verbal d'AGO et le bilan annuel doivent être déposés pour préserver la transparence et la conformité juridique.</p>
    `,
    createdAt: new Date(),
  },
}

export default async function ResourceArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  let dbArticle = null
  try {
    const [fetched] = await db
      .select()
      .from(resourceArticle)
      .where(and(eq(resourceArticle.slug, slug), eq(resourceArticle.published, true), eq(resourceArticle.country, "BJ")))
      .limit(1)
    dbArticle = fetched || null
  } catch (e) {
    dbArticle = null
  }

  const fallback = FALLBACK_ARTICLES[slug]

  if (!dbArticle && !fallback) {
    notFound()
  }

  const title = dbArticle?.title || fallback?.title
  const category = dbArticle?.category || fallback?.category
  const content = dbArticle?.content || fallback?.content
  const createdAt = dbArticle?.createdAt || fallback?.createdAt || new Date()

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <Button asChild variant="ghost" className="mb-6 gap-2 text-slate-600 hover:text-slate-900">
          <Link href="/ressources">
            <ArrowLeft className="w-4 h-4" /> Retour aux ressources
          </Link>
        </Button>

        <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
          <CardHeader className="bg-slate-900 text-white p-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> {category}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {new Date(createdAt).toLocaleDateString("fr-FR")}
              </span>
            </div>
            <CardTitle className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 prose prose-slate max-w-none text-slate-800 leading-relaxed space-y-4">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
