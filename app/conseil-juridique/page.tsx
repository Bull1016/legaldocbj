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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold mb-3">
            <Scale className="w-4 h-4 text-blue-600" /> Conseil & Consultation Juridique
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Posez votre question à un Juriste Expert</h1>
          <p className="text-slate-600 mt-2 text-sm max-w-2xl mx-auto">
            Obtenez des réponses précises et personnalisées sous 24h par nos juristes qualifiés en droit des affaires et fiscalité béninoise/OHADA.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="p-5">
                <ShieldCheck className="w-8 h-8 text-emerald-600 mb-2" />
                <CardTitle className="text-base font-bold">Conseils 100% Confidentiels</CardTitle>
                <CardDescription className="text-xs text-slate-600">
                  Nos juristes sont soumis au secret professionnel strict. Vos données et questions restent confidentielles.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="p-5">
                <MessageSquare className="w-8 h-8 text-blue-600 mb-2" />
                <CardTitle className="text-base font-bold">Réponse sous 24h ouvrées</CardTitle>
                <CardDescription className="text-xs text-slate-600">
                  Un juriste dédié analyse votre situation et vous répond directement dans votre espace client.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="md:col-span-2">
            {!submitted ? (
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="bg-slate-900 text-white rounded-t-xl py-6">
                  <CardTitle className="text-lg font-bold">Soumettre une Demande de Conseil</CardTitle>
                  <CardDescription className="text-slate-300 text-xs">
                    Remplissez ce formulaire détaillé pour obtenir une consultation adaptée.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="p-6 space-y-5">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">Domaine juridique</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(val) => {
                          if (val) setFormData({ ...formData, category: val })
                        }}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Sélectionnez le domaine" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Droit des Sociétés / OHADA">Droit des Sociétés / OHADA</SelectItem>
                          <SelectItem value="Fiscalité & Impôts">Fiscalité & Impôts Béninois</SelectItem>
                          <SelectItem value="Droit du Travail & CNSS">Droit du Travail & CNSS</SelectItem>
                          <SelectItem value="Rédaction de Contrats">Rédaction de Contrats & Baux</SelectItem>
                          <SelectItem value="Propriété Intellectuelle (OAPI)">Propriété Intellectuelle (OAPI)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">Sujet de votre question</Label>
                      <Input
                        required
                        placeholder="Ex: Cession de parts sociales dans une SARL"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">Description détaillée de votre situation</Label>
                      <Textarea
                        required
                        rows={6}
                        placeholder="Expliquez en détail votre situation, les faits et votre besoin de conseil..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="bg-white"
                      />
                    </div>

                    {errorMsg && (
                      <p className="text-xs text-red-600 font-medium">{errorMsg}</p>
                    )}
                  </CardContent>
                  <CardFooter className="bg-slate-50 border-t p-4 rounded-b-xl flex justify-between">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      Tarif consultation : <strong className="text-slate-900">15 000 FCFA</strong>
                    </span>
                    <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Envoyer ma demande
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            ) : (
              <Card className="border-emerald-200 shadow-sm bg-white p-8 text-center space-y-4">
                <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
                <h2 className="text-2xl font-bold text-slate-900">Demande transmise avec succès !</h2>
                <p className="text-slate-600 text-sm max-w-md mx-auto">
                  Votre demande a bien été enregistrée dans votre compte. Nos juristes l'examineront dans les meilleurs délais.
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
