"use client"

import { useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CheckCircle2, ArrowRight, RotateCcw, Building2, HelpCircle } from "lucide-react"
import Link from "next/link"

const QUESTIONS = [
  {
    id: "associates",
    question: "Combien d'associés / fondateurs comptez-vous avoir ?",
    options: [
      { value: "single", label: "Je me lance seul (1 seul associé/exploitant)" },
      { value: "multiple", label: "Nous sommes plusieurs associés (2 ou plus)" },
    ],
  },
  {
    id: "capital",
    question: "Quel est le montant prévisionnel du capital social initial ?",
    options: [
      { value: "low", label: "Moins de 100 000 FCFA (ou sans capital minimum obligatoire)" },
      { value: "medium", label: "Entre 100 000 FCFA et 10 000 000 FCFA" },
      { value: "high", label: "Plus de 10 000 000 FCFA" },
    ],
  },
  {
    id: "liability",
    question: "Quelle protection du patrimoine personnel recherchez-vous ?",
    options: [
      { value: "limited", label: "Responsabilité limitée au montant des apports (Patrimoine personnel protégé)" },
      { value: "unlimited", label: "Responsabilité illimitée (Simplicité de gestion, entreprise individuelle)" },
    ],
  },
  {
    id: "investment",
    question: "Prévoyez-vous d'ouvrir le capital à des investisseurs ou levées de fonds à moyen terme ?",
    options: [
      { value: "yes", label: "Oui, entrée possible d'investisseurs ou associés sous statut flexible" },
      { value: "no", label: "Non, gestion classique et familiale" },
    ],
  },
]

export default function QuizFormeJuridiquePage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<{ form: string; title: string; desc: string; link: string } | null>(null)

  function handleSelect(val: string) {
    setAnswers({ ...answers, [QUESTIONS[currentStep].id]: val })
  }

  function handleNext() {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      calculateResult()
    }
  }

  function calculateResult() {
    const { associates, capital, liability, investment } = answers

    if (associates === "single") {
      if (liability === "unlimited") {
        setResult({
          form: "Établissement (Entreprise Individuelle)",
          title: "Établissement / Établissement Personnel",
          desc: "Idéal pour débuter rapidement avec une structure très simple, sans exigence de capital minimum, parfait pour les commerçants et prestataires solo.",
          link: "/services/creation-entreprise",
        })
      } else if (investment === "yes") {
        setResult({
          form: "SASU (Société par Actions Simplifiée Unipersonnelle)",
          title: "SASU (OHADA)",
          desc: "Excellente flexibilité statutaire pour un entrepreneur solo ambitionnant d'accueillir rapidement des investisseurs.",
          link: "/services/creation-entreprise",
        })
      } else {
        setResult({
          form: "SUARL (SARL Unipersonnelle)",
          title: "SUARL (OHADA)",
          desc: "La forme juridique la plus populaire et sécurisante au Bénin pour un associé unique. Votre responsabilité est strictement limitée à vos apports.",
          link: "/services/creation-entreprise",
        })
      }
    } else {
      if (investment === "yes" || capital === "high") {
        setResult({
          form: "SAS (Société par Actions Simplifiée) ou SA",
          title: "SAS / SA (OHADA)",
          desc: "Parfaitement adaptée pour les projets d'envergure, les startups en levée de fonds et les entreprises cherchant une gouvernance sur-mesure.",
          link: "/services/creation-entreprise",
        })
      } else {
        setResult({
          form: "SARL (Société à Responsabilité Limitée)",
          title: "SARL Pluripersonnelle (OHADA)",
          desc: "Le cadre de référence récurant pour les PME béninoises entre plusieurs associés, offrant une protection juridique équilibrée.",
          link: "/services/creation-entreprise",
        })
      }
    }
  }

  function handleReset() {
    setCurrentStep(0)
    setAnswers({})
    setResult(null)
  }

  const currentQ = QUESTIONS[currentStep]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-semibold mb-3">
            <HelpCircle className="w-4 h-4 text-amber-700" /> Assistant d'Orientation Juridique
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Quel statut juridique choisir ?</h1>
          <p className="text-slate-600 mt-2 text-sm">
            Répondez à 4 questions simples pour identifier la forme juridique la plus adaptée à votre projet au Bénin (Droit OHADA).
          </p>
        </div>

        {!result ? (
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-900 text-white rounded-t-xl py-5">
              <div className="flex justify-between items-center text-xs text-slate-300 font-medium">
                <span>Question {currentStep + 1} sur {QUESTIONS.length}</span>
                <span>{Math.round(((currentStep + 1) / QUESTIONS.length) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / QUESTIONS.length) * 100}%` }}
                />
              </div>
              <CardTitle className="text-lg font-bold mt-4">{currentQ.question}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <RadioGroup value={answers[currentQ.id] || ""} onValueChange={handleSelect} className="space-y-3">
                {currentQ.options.map((opt) => (
                  <div
                    key={opt.value}
                    className={`flex items-center space-x-3 p-4 rounded-xl border transition-all cursor-pointer ${
                      answers[currentQ.id] === opt.value
                        ? "border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                    onClick={() => handleSelect(opt.value)}
                  >
                    <RadioGroupItem value={opt.value} id={opt.value} className="text-emerald-600" />
                    <Label htmlFor={opt.value} className="text-slate-800 text-sm font-medium cursor-pointer flex-1">
                      {opt.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
            <CardFooter className="bg-slate-50 border-t p-4 flex justify-between rounded-b-xl">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                Précédent
              </Button>
              <Button
                onClick={handleNext}
                disabled={!answers[currentQ.id]}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {currentStep === QUESTIONS.length - 1 ? "Voir le résultat" : "Suivant"} <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="border-emerald-200 shadow-md bg-white">
            <CardHeader className="bg-emerald-700 text-white rounded-t-xl text-center py-8">
              <Building2 className="w-12 h-12 text-emerald-200 mx-auto mb-2" />
              <CardTitle className="text-2xl font-bold">Statut Recommandé : {result.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-slate-800">
                <p className="font-medium text-sm leading-relaxed">{result.desc}</p>
              </div>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Conforme à la législation OHADA en République du Bénin</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Obtention rapide du RCCM, IFU et numéro CNSS</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-6 bg-slate-50 border-t flex flex-col gap-3 rounded-b-xl">
              <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-base font-bold rounded-xl">
                <Link href="/dashboard/nouvelle-demande">Lancer la création de mon entreprise</Link>
              </Button>
              <Button variant="ghost" onClick={handleReset} className="text-xs text-slate-600 flex items-center justify-center gap-1">
                <RotateCcw className="w-3.5 h-3.5" /> Recommencer le test
              </Button>
            </CardFooter>
          </Card>
        )}
      </main>
    </div>
  )
}
