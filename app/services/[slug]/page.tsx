import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, FileText, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { getDocumentTypeBySlug, getFieldsForDocumentType } from "@/lib/queries"
import { getSessionUser } from "@/lib/session"
import { formatPrice, FIELD_TYPES } from "@/lib/status"

export const dynamic = "force-dynamic"

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const service = await getDocumentTypeBySlug(slug)
  if (!service) notFound()

  const fields = await getFieldsForDocumentType(service.id)
  const user = await getSessionUser()
  const cta = user ? `/dashboard/nouvelle-demande?service=${service.slug}` : `/sign-up?next=/services/${service.slug}`

  const typeLabel = (t: string) => FIELD_TYPES.find((f) => f.value === t)?.label ?? t

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
        <Link
          href="/#services"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Toutes les démarches
        </Link>

        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-accent text-accent-foreground">
              <FileText className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              {service.category && (
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {service.category}
                </span>
              )}
              <h1 className="font-serif text-3xl font-semibold text-balance">{service.name}</h1>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-semibold">{formatPrice(service.price)}</div>
          </div>
        </div>

        {service.description && (
          <p className="mt-5 max-w-2xl leading-relaxed text-muted-foreground">{service.description}</p>
        )}

        <Card className="mt-8 p-6">
          <h2 className="font-serif text-lg font-semibold">Pièces et informations à fournir</h2>
          {fields.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Aucune information supplémentaire n&apos;est requise pour cette démarche.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {fields.map((field) => (
                <li key={field.id} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <span className="font-medium">{field.label}</span>
                    {field.required && <span className="ml-1 text-xs text-muted-foreground">(obligatoire)</span>}
                    <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                      {typeLabel(field.fieldType)}
                    </span>
                    {field.helpText && <p className="text-sm text-muted-foreground">{field.helpText}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <Link href={cta}>Démarrer cette demande</Link>
          </Button>
          {!user && (
            <p className="text-sm text-muted-foreground">
              Vous avez déjà un compte ?{" "}
              <Link href={`/sign-in?next=/services/${service.slug}`} className="font-medium text-primary underline">
                Connectez-vous
              </Link>
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
