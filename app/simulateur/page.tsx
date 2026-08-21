"use client"

import { useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, CheckCircle, ArrowRight, Info } from "lucide-react"
import Link from "next/link"

export default function SimulateurPage() {
  const [legalForm, setLegalForm] = useState("SARL")
  const [capital, setCapital] = useState(1000000)
  const [employees, setEmployees] = useState(2)

  // Simulation calculations according to Benin/APIEX legal fees
  let creationFees = 50000 // Administrative RCCM + IFU + Announcements
  let notarizationCost = 0
  let estimatedTaxes = 0

  if (legalForm === "Établissement") {
    creationFees = 20000
    notarizationCost = 0
    estimatedTaxes = 10000 // Minimum TPS
  } else if (legalForm === "SARL" || legalForm === "SUARL") {
    creationFees = 50000
    notarizationCost = capital > 1000000 ? Math.round(capital * 0.02) : 25000
    estimatedTaxes = 50000
  } else {
    creationFees = 150000
    notarizationCost = Math.round(capital * 0.025)
    estimatedTaxes = 150000
  }

  const totalCost = creationFees + notarizationCost

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold mb-3">
            <Calculator className="w-4 h-4 text-emerald-600" /> Simulateur Gratuit & Estimation Fiscale
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Simulateur de Coût de Création d'Entreprise</h1>
          <p className="text-slate-600 mt-2 text-sm max-w-xl mx-auto">
            Estimez instantanément les frais officiels d'immatriculation et les charges fiscales au Bénin (Tarifs APIEX & Notaire).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Simulation Inputs */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-900 text-white rounded-t-xl py-5">
              <CardTitle className="text-lg font-bold">Paramètres de votre Entreprise</CardTitle>
              <CardDescription className="text-slate-300 text-xs">Ajustez les paramètres pour voir le calcul en temps réel.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Forme juridique</Label>
                <Select value={legalForm} onValueChange={setLegalForm}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Forme juridique" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Établissement">Établissement / Entreprise Individuelle</SelectItem>
                    <SelectItem value="SUARL">SUARL (SARL 1 associé)</SelectItem>
                    <SelectItem value="SARL">SARL (Pluripersonnelle)</SelectItem>
                    <SelectItem value="SAS">SAS / SASU</SelectItem>
                    <SelectItem value="SA">Société Anonyme (SA)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Capital Social Prévisionnel (FCFA)</Label>
                <Input
                  type="number"
                  value={capital}
                  onChange={(e) => setCapital(Number(e.target.value) || 0)}
                  className="bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Nombre de Salariés prévus</Label>
                <Input
                  type="number"
                  value={employees}
                  onChange={(e) => setEmployees(Number(e.target.value) || 0)}
                  className="bg-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* Result Output */}
          <Card className="border-emerald-200 shadow-md bg-white flex flex-col justify-between">
            <div>
              <CardHeader className="bg-emerald-700 text-white rounded-t-xl py-5">
                <CardTitle className="text-lg font-bold">Estimation Détaillée</CardTitle>
                <CardDescription className="text-emerald-100 text-xs">Détail des frais légaux au Bénin</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600">Frais d'Immatriculation (Guichet/RCCM)</span>
                    <span className="font-bold text-slate-900">{creationFees.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600">Frais de Notaire / Rédaction d'actes</span>
                    <span className="font-bold text-slate-900">{notarizationCost.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                    <span className="font-bold text-slate-900">Total Frais de Création</span>
                    <span className="text-2xl font-black text-emerald-600">{totalCost.toLocaleString()} FCFA</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 space-y-1 mt-4">
                  <p className="font-bold text-slate-800 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-blue-600" /> Régime fiscal estimé :
                  </p>
                  <p>{capital < 50000000 ? "Taxe Professionnelle Synthétique (TPS)" : "Régime Réel Normal (IS / TVA)"}</p>
                </div>
              </CardContent>
            </div>
            <div className="p-6 bg-slate-50 border-t rounded-b-xl">
              <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 font-bold gap-2">
                <Link href="/dashboard/nouvelle-demande">
                  Créer mon entreprise <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
