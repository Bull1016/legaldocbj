import Link from "next/link"
import { Logo } from "@/components/brand"
import { Button } from "@/components/ui/button"
import { getSessionUser } from "@/lib/session"
import { isStaff } from "@/lib/roles"

export async function SiteHeader() {
  const user = await getSessionUser()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" aria-label="Accueil LegalDoc BJ">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link href="/#services" className="transition-colors hover:text-foreground">
            Nos démarches
          </Link>
          <Link href="/#process" className="transition-colors hover:text-foreground">
            Comment ça marche
          </Link>
          <Link href="/#faq" className="transition-colors hover:text-foreground">
            FAQ
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {isStaff(user.role) && (
                <Button asChild variant="ghost" size="sm">
                  <Link href="/admin">Back-office</Link>
                </Button>
              )}
              <Button asChild size="sm">
                <Link href="/dashboard">Mon espace</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/sign-in">Connexion</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/sign-up">Créer un compte</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
