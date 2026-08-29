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
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">Espace Mon Entreprise</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Gérez votre dossier juridique numérique, suivez vos formalités et anticipez vos obligations fiscales &amp; sociales.
            </p>
          </div>
          <Button
            render={
              <Link href="/dashboard/nouvelle-demande">
                <Plus className="w-4 h-4" /> Nouvelle Entreprise / Formalité
              </Link>
            }
            className="font-semibold gap-2"
          />
        </div>

        {companiesList.length === 0 ? (
          <Card className="border-dashed border-2 p-12 text-center">
            <Building2 className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground">Aucune entreprise enregistrée</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mt-2 mb-6">
              Vous n&apos;avez pas encore créé ou immatriculé d&apos;entreprise sur LegalDoc BJ. LANCEZ-VOUS EN QUELQUES CLICS !
            </p>
            <Button
              render={<Link href="/quiz-forme-juridique">Créer mon entreprise maintenant</Link>}
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" /> Mes Structures Enregistrées
              </h2>
              {companiesList.map((c) => (
                <Card key={c.id} className="shadow-sm">
                  <CardHeader className="bg-sidebar text-sidebar-foreground rounded-t-xl py-4 flex flex-row items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg font-bold truncate">{c.name}</CardTitle>
                      <CardDescription className="text-sidebar-foreground/60 text-xs mt-0.5">
                        Forme : <span className="text-sidebar-primary font-semibold">{c.legalForm}</span> | Siège : {c.city}, {c.country}
                      </CardDescription>
                    </div>
                    <span className={`shrink-0 px-3 py-1 border text-xs font-semibold rounded-full ${
                      c.status === "active"
                        ? "bg-success/20 text-success border-success/30"
                        : c.status === "dissolved"
                        ? "bg-destructive/20 text-destructive border-destructive/30"
                        : "bg-warning/20 text-warning border-warning/30"
                    }`}>
                      {c.status === "active" ? "Immatriculée" : c.status === "dissolved" ? "Dissoute" : "En cours de création"}
                    </span>
                  </CardHeader>
                  <CardContent className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <p className="text-muted-foreground font-medium">N° RCCM</p>
                      <p className="font-bold text-foreground mt-1">{c.rccm || "En cours..."}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-medium">N° IFU</p>
                      <p className="font-bold text-foreground mt-1">{c.ifu || "En cours..."}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-medium">Capital Social</p>
                      <p className="font-bold text-foreground mt-1">{(c.capital || 0).toLocaleString()} FCFA</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-medium">Actions</p>
                      <Link href="/dashboard" className="text-primary font-bold hover:underline block mt-1">
                        Gérer les actes &rarr;
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Calendar of Obligations */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-warning" /> Calendrier des Obligations
              </h2>
              <Card className="shadow-sm">
                <CardHeader className="p-4 border-b">
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-foreground">
                    <ShieldAlert className="w-4 h-4 text-warning" /> Échéances à venir
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3 text-xs">
                  <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="font-bold text-foreground">Cotisations Sociales CNSS</p>
                    <p className="text-muted-foreground mt-0.5">Échéance : 15 du mois prochain</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg border border-border">
                    <p className="font-bold text-foreground">Approbation des Comptes Annuels (AGO)</p>
                    <p className="text-muted-foreground mt-0.5">Échéance : Avant le 30 Juin</p>
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
