"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Scale, CheckCircle2, ShieldCheck, Send, Loader2 } from "lucide-react"
import { createLegalAdviceAction } from "@/app/actions/legal-advice"

export default function ConseilJuridiquePage() {
  const router = useRouter()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [formData, setFormData] = useState({
    subject: "",
    category: "Droit des Sociétés / OHADA",
    description: "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.subject.trim() || !formData.description.trim()) return
    setLoading(true)
    setErrorMsg("")

    try {
      const res = await createLegalAdviceAction(formData)
      if (!res.success && res.code === "unauthorized") {
        router.push("/sign-in?next=/conseil-juridique")
        return
      }
      if (!res.success) {
        setErrorMsg(res.error)
        return
      }
      setSubmitted(true)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Une erreur s'est produite lors de la soumission.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold mb-3 border border-primary/20">
            <Scale className="w-4 h-4" /> Conseil &amp; Consultation Juridique
          </div>
          <h1 className="text-3xl font-extrabold text-foreground">Posez votre question à un Juriste Expert</h1>
          <p className="text-muted-foreground mt-2 text-sm max-w-2xl mx-auto">
            Obtenez des réponses précises et personnalisées sous 24h par nos juristes qualifiés en droit des affaires et fiscalité béninoise/OHADA.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader className="p-5">
                <ShieldCheck className="w-8 h-8 text-success mb-2" />
                <CardTitle className="text-base font-bold text-foreground">Conseils 100% Confidentiels</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Nos juristes sont soumis au secret professionnel strict. Vos données et questions restent confidentielles.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="p-5">
                <MessageSquare className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-base font-bold text-foreground">Réponse sous 24h ouvrées</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Un juriste dédié analyse votre situation et vous répond directement dans votre espace client.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="md:col-span-2">
            {!submitted ? (
              <Card className="shadow-sm">
                <CardHeader className="bg-sidebar text-sidebar-foreground rounded-t-xl py-6">
                  <CardTitle className="text-lg font-bold">Soumettre une Demande de Conseil</CardTitle>
                  <CardDescription className="text-sidebar-foreground/60 text-xs">
                    Remplissez ce formulaire détaillé pour obtenir une consultation adaptée.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="p-6 space-y-5">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground">Domaine juridique</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(val) => {
                          if (val) setFormData({ ...formData, category: val })
                        }}
                      >
                        <SelectTrigger className="bg-card">
                          <SelectValue placeholder="Sélectionnez le domaine" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Droit des Sociétés / OHADA">Droit des Sociétés / OHADA</SelectItem>
                          <SelectItem value="Fiscalité & Impôts">Fiscalité &amp; Impôts Béninois</SelectItem>
                          <SelectItem value="Droit du Travail & CNSS">Droit du Travail &amp; CNSS</SelectItem>
                          <SelectItem value="Rédaction de Contrats">Rédaction de Contrats &amp; Baux</SelectItem>
                          <SelectItem value="Propriété Intellectuelle (OAPI)">Propriété Intellectuelle (OAPI)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground">Sujet de votre question</Label>
                      <Input
                        required
                        placeholder="Ex: Cession de parts sociales dans une SARL"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="bg-card"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground">Description détaillée de votre situation</Label>
                      <Textarea
                        required
                        rows={6}
                        placeholder="Expliquez en détail votre situation, les faits et votre besoin de conseil..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="bg-card"
                      />
                    </div>

                    {errorMsg && (
                      <p className="text-xs text-destructive font-medium">{errorMsg}</p>
                    )}
                  </CardContent>
                  <CardFooter className="bg-muted/40 border-t p-4 rounded-b-xl flex justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      Tarif consultation : <strong className="text-foreground">15 000 FCFA</strong>
                    </span>
                    <Button type="submit" disabled={loading} className="font-semibold gap-2">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Envoyer ma demande
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            ) : (
              <Card className="border-success/30 shadow-sm bg-card p-8 text-center space-y-4">
                <CheckCircle2 className="w-16 h-16 text-success mx-auto" />
                <h2 className="text-2xl font-bold text-foreground">Demande transmise avec succès !</h2>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  Votre demande a bien été enregistrée dans votre compte. Nos juristes l&apos;examineront dans les meilleurs délais.
                </p>
                <Button onClick={() => setSubmitted(false)} variant="outline" className="mt-4">
                  Poser une autre question
                </Button>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
