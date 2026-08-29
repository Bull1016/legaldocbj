"use client"

import Link from "next/link"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { Logo } from "@/components/brand"
import { Button, buttonVariants } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/quiz-forme-juridique", label: "Créer mon entreprise" },
  { href: "/modeles-juridiques", label: "Modèles d'actes" },
  { href: "/conseil-juridique", label: "Conseil Juridique" },
  { href: "/simulateur", label: "Simulateur" },
  { href: "/abonnements", label: "Solutions Entreprises" },
  { href: "/ressources", label: "Ressources" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <Link href="/" aria-label="Accueil LegalDoc BJ">
          <Logo />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-5 text-sm text-muted-foreground lg:flex" aria-label="Navigation principale">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "transition-colors hover:text-foreground font-medium",
                pathname === link.href && "text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/mon-entreprise"
            className={cn(buttonVariants({ size: "sm" }), "hidden sm:inline-flex font-semibold")}
          >
            Mon espace entreprise
          </Link>
          <Link
            href="/sign-in"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Connexion
          </Link>

          {/* Mobile hamburger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  aria-label="Ouvrir le menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              }
            />
            <SheetContent side="right" className="w-72 p-0">
              <div className="flex h-16 items-center justify-between border-b border-border px-5">
                <Link href="/" onClick={() => setOpen(false)} aria-label="Accueil">
                  <Logo />
                </Link>
                <Button variant="ghost" size="sm" onClick={() => setOpen(false)} aria-label="Fermer le menu">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="flex flex-col gap-1 p-4" aria-label="Navigation mobile">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                      pathname === link.href
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="my-2 border-t border-border" />
                <Link
                  href="/mon-entreprise"
                  onClick={() => setOpen(false)}
                  className={cn(buttonVariants({ size: "sm" }), "font-semibold w-full text-center justify-center")}
                >
                  Mon espace entreprise
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
