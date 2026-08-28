"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Logo } from "@/components/brand"
import { toast } from "sonner"

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestedNext = searchParams.get("next")
  const next = requestedNext?.startsWith("/") && !requestedNext.startsWith("//")
    ? requestedNext
    : "/dashboard"
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [twoFactorRequired, setTwoFactorRequired] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState("")

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === "sign-up") {
        const { error } = await authClient.signUp.email({ email, password, name })
        if (error) throw new Error(error.message || "Inscription impossible")
      } else {
        const { data, error } = await authClient.signIn.email({ email, password })
        if (error) throw new Error(error.message || "Connexion impossible")
        if (data && "twoFactorRedirect" in data && data.twoFactorRedirect) {
          setTwoFactorRequired(true)
          setLoading(false)
          return
        }
      }
      router.push(next)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Une erreur est survenue")
      setLoading(false)
    }
  }

  async function onVerifyTwoFactor(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await authClient.twoFactor.verifyTotp({
        code: twoFactorCode,
        trustDevice: false,
      })
      if (error) throw new Error(error.message || "Code de vérification invalide")
      router.push(next)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Vérification impossible")
      setLoading(false)
    }
  }

  const isSignUp = mode === "sign-up"

  if (twoFactorRequired) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-card/40 px-4 py-10">
        <Link href="/" className="mb-6" aria-label="Accueil">
          <Logo className="text-xl" />
        </Link>
        <Card className="w-full max-w-sm p-6 sm:p-8">
          <h1 className="font-serif text-2xl font-semibold text-balance">Vérification en deux étapes</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Saisissez le code à six chiffres de votre application d'authentification.
          </p>
          <form onSubmit={onVerifyTwoFactor} className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="two-factor-code">Code de vérification</Label>
              <Input
                id="two-factor-code"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                required
                autoFocus
              />
            </div>
            <Button type="submit" disabled={loading || twoFactorCode.length !== 6} className="w-full">
              {loading ? "Vérification…" : "Vérifier et se connecter"}
            </Button>
          </form>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-card/40 px-4 py-10">
      <Link href="/" className="mb-6" aria-label="Accueil">
        <Logo className="text-xl" />
      </Link>
      <Card className="w-full max-w-sm p-6 sm:p-8">
        <h1 className="font-serif text-2xl font-semibold text-balance">
          {isSignUp ? "Créer votre compte" : "Connexion à votre espace"}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {isSignUp
            ? "Accédez à vos démarches en quelques secondes."
            : "Retrouvez vos demandes et leur avancement."}
        </p>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
          {isSignUp && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Marie Dupont"
                required
                autoComplete="name"
              />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Adresse e-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.fr"
              required
              autoComplete="email"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              autoComplete={isSignUp ? "new-password" : "current-password"}
            />
            {isSignUp && <p className="text-xs text-muted-foreground">Au moins 8 caractères.</p>}
          </div>

          <Button type="submit" disabled={loading} className="mt-1 w-full">
            {loading ? "Veuillez patienter…" : isSignUp ? "Créer mon compte" : "Se connecter"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isSignUp ? "Vous avez déjà un compte ? " : "Pas encore de compte ? "}
          <Link
            href={isSignUp ? "/sign-in" : "/sign-up"}
            className="font-medium text-primary underline underline-offset-2"
          >
            {isSignUp ? "Se connecter" : "Créer un compte"}
          </Link>
        </p>
      </Card>
    </div>
  )
}
