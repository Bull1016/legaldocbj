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

function finiteNonNegative(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0
}

export default function SimulateurPage() {
  const [legalForm, setLegalForm] = useState("SARL")
  const [capital, setCapital] = useState(1000000)
  const [turnover, setTurnover] = useState(15000000)
  const [employees, setEmployees] = useState(2)

  // Simulation calculations according to Benin/APIEX legal fees
  let creationFees = 50000 // Administrative RCCM + IFU + Announcements
  let notarizationCost = 0
  let estimatedTaxes = 0

  const safeCapital = Math.max(0, capital)
  const safeEmployees = Math.max(0, employees)
  const safeTurnover = Math.max(0, turnover)

  if (legalForm === "Établissement") {
    creationFees = 20000
    notarizationCost = 0
    estimatedTaxes = 10000 + safeEmployees * 5000 // Minimum TPS + charges
  } else if (legalForm === "SARL" || legalForm === "SUARL") {
    creationFees = 50000
    notarizationCost = safeCapital > 1000000 ? Math.round(safeCapital * 0.02) : 25000
    estimatedTaxes = 50000 + safeEmployees * 10000
  } else {
    creationFees = 150000
    notarizationCost = Math.round(safeCapital * 0.025)
    estimatedTaxes = 150000 + safeEmployees * 15000
  }

  const totalCost = creationFees + notarizationCost + estimatedTaxes

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-success/15 text-success rounded-full text-xs font-semibold mb-3 border border-success/30">
            <Calculator className="w-4 h-4" /> Simulateur Gratuit &amp; Estimation Fiscale
          </div>
          <h1 className="text-3xl font-extrabold text-foreground">Simulateur de Coût de Création d&apos;Entreprise</h1>
          <p className="text-muted-foreground mt-2 text-sm max-w-xl mx-auto">
            Estimez instantanément les frais officiels d&apos;immatriculation et les charges fiscales au Bénin (Tarifs APIEX &amp; Notaire).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Simulation Inputs */}
          <Card className="shadow-sm">
            <CardHeader className="bg-sidebar text-sidebar-foreground rounded-t-xl py-5">
              <CardTitle className="text-lg font-bold">Paramètres de votre Entreprise</CardTitle>
              <CardDescription className="text-sidebar-foreground/60 text-xs">Ajustez les paramètres pour voir le calcul en temps réel.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Forme juridique</Label>
                <Select value={legalForm} onValueChange={(value) => value && setLegalForm(value)}>
                  <SelectTrigger className="bg-card">
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
                <Label className="text-xs font-semibold text-muted-foreground">Capital Social Prévisionnel (FCFA)</Label>
                <Input
                  type="number"
                  min={0}
                  value={capital}
                  onChange={(e) => setCapital(finiteNonNegative(e.target.value))}
                  className="bg-card"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Chiffre d&apos;Affaires Annuel Prévisionnel (FCFA)</Label>
                <Input
                  type="number"
                  min={0}
                  value={turnover}
                  onChange={(e) => setTurnover(finiteNonNegative(e.target.value))}
                  className="bg-card"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Nombre de Salariés prévus</Label>
                <Input
                  type="number"
                  min={0}
                  value={employees}
                  onChange={(e) => setEmployees(finiteNonNegative(e.target.value))}
                  className="bg-card"
                />
              </div>
            </CardContent>
          </Card>

          {/* Result Output */}
          <Card className="border-primary/30 shadow-md bg-card flex flex-col justify-between">
            <div>
              <CardHeader className="bg-primary text-primary-foreground rounded-t-xl py-5">
                <CardTitle className="text-lg font-bold">Estimation Détaillée</CardTitle>
                <CardDescription className="text-primary-foreground/70 text-xs">Détail des frais légaux au Bénin</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Frais d&apos;Immatriculation (Guichet/RCCM)</span>
                    <span className="font-bold text-foreground">{creationFees.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Frais de Notaire / Rédaction d&apos;actes</span>
                    <span className="font-bold text-foreground">{notarizationCost.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Estimation Impôts &amp; Charges Salariales</span>
                    <span className="font-bold text-foreground">{estimatedTaxes.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-primary/5 rounded-xl p-3 border border-primary/20">
                    <span className="font-bold text-foreground">Total Estimation Globale</span>
                    <span className="text-2xl font-black text-primary">{totalCost.toLocaleString()} FCFA</span>
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-lg text-xs text-muted-foreground space-y-1 mt-4">
                  <p className="font-bold text-foreground flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-primary" /> Régime fiscal estimé (selon CA annuel) :
                  </p>
                  <p>{safeTurnover < 50000000 ? "Taxe Professionnelle Synthétique (TPS)" : "Régime Réel Normal (IS / TVA)"}</p>
                </div>
              </CardContent>
            </div>
            <div className="p-6 bg-muted/40 border-t rounded-b-xl">
              <Button
                render={
                  <Link href="/dashboard/nouvelle-demande">
                    Créer mon entreprise <ArrowRight className="w-4 h-4" />
                  </Link>
                }
                className="w-full py-5 font-bold gap-2"
              />
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
