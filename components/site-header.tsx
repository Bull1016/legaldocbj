import Link from "next/link"
import { Logo } from "@/components/brand"
import { Button } from "@/components/ui/button"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <Link href="/" aria-label="Accueil LegalDoc BJ">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
          <Link href="/quiz-forme-juridique" className="transition-colors hover:text-foreground font-medium">
            Créer mon entreprise
          </Link>
          <Link href="/modeles-juridiques" className="transition-colors hover:text-foreground">
            Modèles d'actes
          </Link>
          <Link href="/conseil-juridique" className="transition-colors hover:text-foreground">
            Conseil Juridique
          </Link>
          <Link href="/simulateur" className="transition-colors hover:text-foreground">
            Simulateur
          </Link>
          <Link href="/abonnements" className="transition-colors hover:text-foreground">
            Solutions Entreprises
          </Link>
          <Link href="/ressources" className="transition-colors hover:text-foreground">
            Ressources
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
            <Link href="/mon-entreprise">Mon espace entreprise</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/sign-in">Connexion</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
