import Link from "next/link"
import { ArrowLeft, LayoutDashboard, FilePlus2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { DashboardShell } from "@/components/dashboard-shell"
import { ServiceCard } from "@/components/service-card"
import { RequestForm } from "@/components/request-form"
import { getSessionUser } from "@/lib/session"
import { getActiveDocumentTypes, getDocumentTypeBySlug, getFieldsForDocumentType } from "@/lib/queries"
import { formatPrice } from "@/lib/status"

const clientNav = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/dashboard/nouvelle-demande", label: "Nouvelle demande", icon: FilePlus2 },
]

export default async function NewRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>
}) {
  const user = (await getSessionUser())!
  const { service: slug } = await searchParams

  const selected = slug ? await getDocumentTypeBySlug(slug) : null

  return (
    <DashboardShell user={user} nav={clientNav} currentPath="/dashboard/nouvelle-demande" title="Nouvelle demande">
      {!selected ? (
        <>
          <p className="mb-6 text-muted-foreground">Choisissez la démarche que vous souhaitez effectuer.</p>
          <ServicePicker />
        </>
      ) : (
        <>
          <Link
            href="/dashboard/nouvelle-demande"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Changer de démarche
          </Link>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              {selected.category && (
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {selected.category}
                </span>
              )}
              <h2 className="font-serif text-2xl font-semibold text-balance">{selected.name}</h2>
            </div>
            <span className="text-lg font-semibold">{formatPrice(selected.price)}</span>
          </div>
          {selected.description && (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{selected.description}</p>
          )}

          <Card className="mt-6 max-w-2xl p-6">
            <FormLoader documentTypeId={selected.id} />
          </Card>
        </>
      )}
    </DashboardShell>
  )
}

async function ServicePicker() {
  const services = await getActiveDocumentTypes()
  if (services.length === 0) {
    return (
      <Card className="p-12 text-center text-muted-foreground">
        Aucune démarche n&apos;est disponible pour le moment.
      </Card>
    )
  }
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((s) => (
        <ServiceCard key={s.id} service={s} href={`/dashboard/nouvelle-demande?service=${s.slug}`} />
      ))}
    </div>
  )
}

async function FormLoader({ documentTypeId }: { documentTypeId: number }) {
  const fields = await getFieldsForDocumentType(documentTypeId)
  return <RequestForm documentTypeId={documentTypeId} fields={fields} />
}
