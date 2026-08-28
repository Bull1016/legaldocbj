import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, LayoutDashboard, FilePlus2, FileText, Download } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DashboardShell } from "@/components/dashboard-shell"
import { StatusBadge } from "@/components/status-badge"
import { SubmitDraftButton } from "@/components/submit-draft-button"
import { getSessionUser } from "@/lib/session"
import { getMyRequestDetail, getFieldsForForm } from "@/app/actions/requests"

const clientNav = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/dashboard/nouvelle-demande", label: "Nouvelle demande", icon: FilePlus2 },
]

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const requestId = Number(id)
  if (Number.isNaN(requestId)) notFound()

  const user = (await getSessionUser())!
  const detail = await getMyRequestDetail(requestId)
  if (!detail) notFound()

  const { request: req, documentType, values, events } = detail
  const fields = await getFieldsForForm(req.documentTypeId)
  const fieldLabel = (fieldId: number, key: string) => fields.find((f) => f.id === fieldId)?.label ?? key
  const canSubmit = req.status === "draft" || req.status === "need_info"

  return (
    <DashboardShell user={user} nav={clientNav} title={documentType?.name ?? "Demande"}>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Retour aux demandes
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-semibold">{documentType?.name}</h2>
          <p className="text-sm text-muted-foreground">
            Référence {req.reference} · Créée le {new Date(req.createdAt).toLocaleDateString("fr-FR")}
          </p>
        </div>
        <StatusBadge status={req.status} />
      </div>

      {canSubmit && (
        <Card className="mt-6 flex flex-wrap items-center justify-between gap-3 border-warning/30 bg-warning/5 p-4">
          <p className="text-sm">
            {req.status === "need_info"
              ? "Des informations complémentaires sont attendues. Vous pouvez re-soumettre votre demande."
              : "Cette demande est un brouillon. Soumettez-la pour qu'elle soit traitée."}
          </p>
          <SubmitDraftButton requestId={req.id} />
        </Card>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <h3 className="font-serif text-lg font-semibold">Informations soumises</h3>
          <Separator className="my-4" />
          {values.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune information n&apos;a encore été renseignée.</p>
          ) : (
            <dl className="space-y-4">
              {values.map((v) => (
                <div key={v.id} className="flex flex-col gap-1">
                  <dt className="text-sm font-medium text-muted-foreground">{fieldLabel(v.fieldId, v.fieldKey)}</dt>
                  <dd className="text-sm">
                    {v.fileUrl ? (
                      <a
                        href={`/api/documents/${v.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-primary underline"
                      >
                        <FileText className="h-4 w-4" aria-hidden="true" />
                        {v.fileName ?? "Fichier joint"}
                        <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    ) : (
                      (v.value ?? "—")
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="font-serif text-lg font-semibold">Historique</h3>
          <Separator className="my-4" />
          <ol className="space-y-4">
            {events.map((e) => (
              <li key={e.id} className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                <div>
                  <p className="text-sm">{e.message ?? e.type}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.actorName ? `${e.actorName} · ` : ""}
                    {new Date(e.createdAt).toLocaleString("fr-FR")}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </DashboardShell>
  )
}
