"use client"

import { useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Bot, Send, Sparkles, User, ArrowRight } from "lucide-react"
import Link from "next/link"

interface Message {
  sender: "bot" | "user"
  text: string
  actionUrl?: string
  actionText?: string
}

const KNOWLEDGE_BASE = [
  {
    keywords: ["créer", "entreprise", "sarl", "suarl", "société", "établissement", "statut"],
    reply: "Pour créer votre entreprise au Bénin, vous pouvez utiliser notre assistant d'orientation pour choisir la meilleure forme juridique ou lancer directement votre demande d'immatriculation en ligne.",
    actionUrl: "/quiz-forme-juridique",
    actionText: "Faire le quiz d'orientation",
  },
  {
    keywords: ["casier", "judiciaire", "résidence", "certificat", "nationalité", "document", "administratif"],
    reply: "LegalDoc BJ vous permet d'obtenir vos pièces administratives (Casier judiciaire, Certificat de résidence, Certificat de nationalité) en 48h sans vous déplacer.",
    actionUrl: "/dashboard/nouvelle-demande",
    actionText: "Commander une pièce administrative",
  },
  {
    keywords: ["tarif", "prix", "coût", "combien", "simulateur", "frais"],
    reply: "Vous pouvez calculer gratuitement l'estimation exacte des frais de création d'entreprise et des taxes d'immatriculation au Bénin grâce à notre simulateur.",
    actionUrl: "/simulateur",
    actionText: "Ouvrir le simulateur de coûts",
  },
  {
    keywords: ["modèle", "contrat", "statuts", "pv", "acte", "modèle"],
    reply: "Découvrez notre bibliothèque de modèles d'actes juridiques (Statuts OHADA, Contrats de prestation...) pré-remplissables et téléchargeables immédiatement.",
    actionUrl: "/modeles-juridiques",
    actionText: "Consulter la bibliothèque de modèles",
  },
  {
    keywords: ["conseil", "juriste", "question", "avocat", "consultation"],
    reply: "Vous avez une question spécifique sur le droit des affaires ou la fiscalité ? Posez-la directement à l'un de nos juristes qualifiés.",
    actionUrl: "/conseil-juridique",
    actionText: "Poser une question à un juriste",
  },
]

export default function AssistantConversationnelPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Bonjour ! Je suis l'Assistant Virtuel LegalDoc BJ. Comment puis-je vous guider aujourd'hui dans vos démarches juridiques ou la gestion de votre entreprise ?",
    },
  ])
  const [input, setInput] = useState("")

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg = input.trim()
    const newMessages: Message[] = [...messages, { sender: "user", text: userMsg }]
    setMessages(newMessages)
    setInput("")

    // Match keywords
    const lower = userMsg.toLowerCase()
    const matched = KNOWLEDGE_BASE.find((k) => k.keywords.some((kw) => lower.includes(kw)))

    setTimeout(() => {
      if (matched) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: matched.reply,
            actionUrl: matched.actionUrl,
            actionText: matched.actionText,
          },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "Je n'ai pas parfaitement compris votre besoin. Vous pouvez parcourir nos démarches dans le catalogue ou consulter notre centre de ressources juridiques.",
            actionUrl: "/services/creation-entreprise",
            actionText: "Découvrir toutes nos démarches",
          },
        ])
      }
    }, 600)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold mb-3">
            <Sparkles className="w-4 h-4 text-emerald-600" /> Assistant Conversationnel
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Orientation & Assistance Légale</h1>
          <p className="text-slate-600 mt-2 text-sm">
            Posez votre question en langage naturel pour être immédiatement dirigé vers le bon service ou document.
          </p>
        </div>

        <Card className="border-slate-200 shadow-md bg-white flex flex-col h-[520px]">
          <CardHeader className="bg-slate-900 text-white rounded-t-xl py-4 flex flex-row items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">Assistant LegalDoc BJ</CardTitle>
              <CardDescription className="text-emerald-300 text-xs">Disponible 24h/24 & 7j/7</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-3 text-sm ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "bot" && (
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-emerald-600" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    m.sender === "user"
                      ? "bg-emerald-600 text-white rounded-br-none"
                      : "bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200"
                  }`}
                >
                  <p className="leading-relaxed">{m.text}</p>
                  {m.actionUrl && (
                    <Button
                      asChild
                      size="sm"
                      className="mt-3 bg-slate-900 hover:bg-slate-800 text-white text-xs gap-1.5 w-full font-semibold"
                    >
                      <Link href={m.actionUrl}>
                        {m.actionText} <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </Button>
                  )}
                </div>
                {m.sender === "user" && (
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 text-white">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
          </CardContent>

          <CardFooter className="p-4 bg-slate-50 border-t rounded-b-xl">
            <form onSubmit={handleSend} className="flex gap-2 w-full">
              <Input
                placeholder="Ex: Je souhaite créer une SARL au Bénin..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="bg-white"
              />
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 px-5">
                <Send className="w-4 h-4" /> Envoyer
              </Button>
            </form>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
