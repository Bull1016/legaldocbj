import Link from "next/link"
import Image from "next/image"
import { ShieldCheck, Clock, FileCheck2, UserPlus, Send, BadgeCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { ServiceCard } from "@/components/service-card"
import { Logo } from "@/components/brand"
import { getActiveDocumentTypes } from "@/lib/queries"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const services = await getActiveDocumentTypes()

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Vos démarches administratives, sécurisées
              </span>
              <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight text-balance md:text-5xl">
                Obtenez vos documents officiels sans vous déplacer
              </h1>
              <p className="mt-4 max-w-md text-pretty leading-relaxed text-muted-foreground">
                Casier judiciaire, certificat de nationalité et bien d&apos;autres démarches. Créez votre compte,
                soumettez vos informations et suivez l&apos;avancement en temps réel.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link href="/sign-up">Créer mon compte</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="#services">Voir les démarches</Link>
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" aria-hidden="true" /> Suivi en temps réel
                </span>
                <span className="inline-flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-primary" aria-hidden="true" /> Documents vérifiés
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
                <Image
                  src="/hero-legal.png"
                  alt="Bureau de services juridiques avec documents officiels organisés"
                  width={720}
                  height={560}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Services / catalogue */}
        <section id="services" className="border-t border-border bg-card/40">
          <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
            <div className="mb-10 max-w-2xl">
              <h2 className="font-serif text-3xl font-semibold text-balance">Nos démarches disponibles</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                Choisissez la démarche qui vous concerne. Chaque service précise les pièces et informations à fournir.
              </p>
            </div>

            {services.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
                <p className="text-muted-foreground">
                  Le catalogue est en cours de préparation. Revenez très bientôt.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                  <ServiceCard key={service.id} service={service} href={`/services/${service.slug}`} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Process */}
        <section id="process" className="border-t border-border">
          <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
            <h2 className="mb-10 font-serif text-3xl font-semibold text-balance">Comment ça marche</h2>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  icon: UserPlus,
                  title: "Créez votre compte",
                  text: "Inscrivez-vous en quelques secondes avec votre e-mail pour accéder à votre espace personnel.",
                },
                {
                  icon: Send,
                  title: "Soumettez votre demande",
                  text: "Remplissez le formulaire propre à chaque démarche et joignez les pièces demandées.",
                },
                {
                  icon: BadgeCheck,
                  title: "Suivez et recevez",
                  text: "Nos agents traitent votre dossier. Suivez chaque étape jusqu'à la finalisation.",
                },
              ].map((step) => (
                <div key={step.title} className="rounded-xl border border-border bg-card p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
                    <step.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-serif text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="border-t border-border bg-card/40">
          <div className="mx-auto max-w-3xl px-4 py-16 md:py-20">
            <h2 className="mb-8 font-serif text-3xl font-semibold text-balance">Questions fréquentes</h2>
            <div className="space-y-6">
              {[
                {
                  q: "Mes documents sont-ils en sécurité ?",
                  a: "Vos informations et pièces jointes sont stockées de manière sécurisée et ne sont accessibles qu'aux agents habilités à traiter votre dossier.",
                },
                {
                  q: "Combien de temps prend une démarche ?",
                  a: "Les délais dépendent de la démarche. Vous suivez l'avancement de votre dossier en temps réel depuis votre espace.",
                },
                {
                  q: "Puis-je suivre plusieurs demandes ?",
                  a: "Oui. Votre espace personnel regroupe l'ensemble de vos demandes et leur statut.",
                },
              ].map((item) => (
                <div key={item.q} className="border-b border-border pb-6">
                  <h3 className="font-medium">{item.q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row">
          <Logo className="text-base" />
          <p>© {new Date().getFullYear()} LegalDoc BJ. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}
