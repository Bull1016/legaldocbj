"use client"

import { useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Download, FileText, Sparkles, Check } from "lucide-react"

const TEMPLATES_DATA = [
  {
    id: 1,
    title: "Statuts Constitutifs SARL / SUARL (OHADA)",
    category: "Statuts",
    description: "Modèle complet de statuts conforme au droit des sociétés commerciales OHADA applicable au Bénin.",
    isFree: true,
    fields: [
      { key: "companyName", label: "Dénomination sociale (Nom)", placeholder: "Ex: AFRIQUE TECH SARL" },
      { key: "managerName", label: "Nom et Prénom du Gérant", placeholder: "Ex: Koffi Mensah" },
      { key: "capital", label: "Capital Social (FCFA)", placeholder: "Ex: 1 000 000" },
      { key: "address", label: "Siège Social (Adresse)", placeholder: "Ex: Cotonou, Quartier Haie Vive" },
      { key: "activity", label: "Objet Social / Activité Principale", placeholder: "Ex: Prestations de services informatiques et conseils" },
    ],
    templateText: `STATUTS CONSTITUTIFS DE LA SOCIÉTÉ

ARTICLE 1 : FORME JURIDIQUE
Il est formé entre le(s) soussigné(s) une Société à Responsabilité Limitée régie par l'Acte Uniforme OHADA relatif au droit des sociétés commerciales.

ARTICLE 2 : DÉNOMINATION SOCIALE
La société prend la dénomination sociale de : {{companyName}}.

ARTICLE 3 : SIÈGE SOCIAL
Le siège social est fixé à : {{address}}.

ARTICLE 4 : OBJET SOCIAL
La société a pour objet en République du Bénin et à l'étranger : {{activity}}.

ARTICLE 5 : CAPITAL SOCIAL
Le capital social est fixé à la somme de {{capital}} FCFA, divisé en parts sociales souscrites en totalité.

ARTICLE 6 : GÉRANCE
La société est administrée et gérée par M./Mme {{managerName}}, nommé(e) en qualité de premier gérant.

Fait à Cotonou, le {{date}}.`,
  },
  {
    id: 2,
    title: "Contrat de Prestation de Services",
    category: "Contrats",
    description: "Contrat cadre commercial de prestation de services entre entreprises ou prestataires indépendants.",
    isFree: true,
    fields: [
      { key: "providerName", label: "Nom du Prestataire / Société", placeholder: "Ex: BENIN CONSULTING" },
      { key: "clientName", label: "Nom du Client / Entreprise", placeholder: "Ex: SOGECOM SA" },
      { key: "serviceScope", label: "Description de la Prestation", placeholder: "Ex: Développement du site web e-commerce" },
      { key: "price", label: "Montant Total de la Prestation (FCFA)", placeholder: "Ex: 500 000" },
    ],
    templateText: `CONTRAT DE PRESTATION DE SERVICES

ENTRE LES SOUSSIGNÉS :
Le Prestataire : {{providerName}}
Et
Le Client : {{clientName}}

ARTICLE 1 : OBJET DU CONTRAT
Le Prestataire s'engage à exécuter pour le Client la prestation suivante : {{serviceScope}}.

ARTICLE 2 : PRIX ET MODALITÉS DE PAIEMENT
Le montant convenu pour la réalisation de cette prestation est de {{price}} FCFA TTC.

ARTICLE 3 : LOI APPLICABLE
Le présent contrat est soumis au droit des obligations et au droit commercial OHADA en République du Bénin.

Fait à Cotonou, le {{date}}.`,
  },
]

export default function ModelesJuridiquesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES_DATA[0])
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [previewText, setPreviewText] = useState("")

  function handleFieldChange(key: string, val: string) {
    const updated = { ...formData, [key]: val }
    setFormData(updated)
    generateDocument(selectedTemplate, updated)
  }

  function generateDocument(template: typeof TEMPLATES_DATA[0], data: Record<string, string>) {
    let text = template.templateText
    template.fields.forEach((f) => {
      const val = data[f.key] || `[${f.label}]`
      text = text.replaceAll(`{{${f.key}}}`, val)
    })
    text = text.replaceAll("{{date}}", new Date().toLocaleDateString("fr-FR"))
    setPreviewText(text)
  }

  function handleSelectTemplate(t: typeof TEMPLATES_DATA[0]) {
    setSelectedTemplate(t)
    setFormData({})
    generateDocument(t, {})
  }

  function handleDownload() {
    let textToDownload = previewText
    if (!textToDownload) {
      textToDownload = selectedTemplate.templateText
      selectedTemplate.fields.forEach((f) => {
        const val = formData[f.key] || `[${f.label}]`
        textToDownload = textToDownload.replaceAll(`{{${f.key}}}`, val)
      })
      textToDownload = textToDownload.replaceAll("{{date}}", new Date().toLocaleDateString("fr-FR"))
    }
    const element = document.createElement("a")
    const file = new Blob([textToDownload], { type: "text/plain;charset=utf-8" })
    element.href = URL.createObjectURL(file)
    element.download = `${selectedTemplate.title.replaceAll(" ", "_")}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-6xl">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold mb-3">
            <Sparkles className="w-4 h-4 text-emerald-600" /> Modèles Juridiques Personnalisables
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Bibliothèque de Modèles & Actes Juridiques</h1>
          <p className="text-slate-600 mt-2 text-sm">
            Sélectionnez un modèle, renseignez vos informations et téléchargez votre document prêt à l'emploi.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Template Selection List */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" /> Modèles Disponibles
            </h2>
            {TEMPLATES_DATA.map((tmpl) => (
              <Card
                key={tmpl.id}
                role="button"
                tabIndex={0}
                aria-pressed={selectedTemplate.id === tmpl.id}
                onClick={() => handleSelectTemplate(tmpl)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    handleSelectTemplate(tmpl)
                  }
                }}
                className={`cursor-pointer transition-all border focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
                  selectedTemplate.id === tmpl.id
                    ? "border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <CardHeader className="p-4">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {tmpl.category}
                    </span>
                    {tmpl.isFree && (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Gratuit
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-base font-bold text-slate-900 mt-2">{tmpl.title}</CardTitle>
                  <CardDescription className="text-xs text-slate-600 line-clamp-2 mt-1">
                    {tmpl.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Document Editor & Preview */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-900 text-white rounded-t-xl py-5 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">{selectedTemplate.title}</CardTitle>
                  <CardDescription className="text-slate-300 text-xs mt-1">
                    Personnalisez les champs ci-dessous pour mettre à jour l'acte.
                  </CardDescription>
                </div>
                <Button onClick={handleDownload} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-semibold">
                  <Download className="w-4 h-4" /> Télécharger (.txt)
                </Button>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {selectedTemplate.fields.map((f) => (
                    <div key={f.key} className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">{f.label}</Label>
                      <Input
                        placeholder={f.placeholder}
                        value={formData[f.key] || ""}
                        onChange={(e) => handleFieldChange(f.key, e.target.value)}
                        className="bg-white border-slate-300"
                      />
                    </div>
                  ))}
                </div>

                {/* Realtime Document Text Preview */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" /> Prévisualisation du Document :
                  </Label>
                  <Textarea
                    readOnly
                    value={previewText || selectedTemplate.templateText}
                    className="min-h-[350px] font-mono text-xs bg-slate-900 text-slate-100 p-4 rounded-xl leading-relaxed border-none shadow-inner"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
