import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, FileText, Download, User, Mail, Calendar, HelpCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { StatusBadge } from "@/components/status-badge"
import { adminGetRequestDetail, adminGetDocumentFields } from "@/app/actions/admin"
import { RequestAdminControls } from "@/components/request-admin-controls"

export const dynamic = "force-dynamic"

export default async function AdminRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const requestId = Number(id)
  if (Number.isNaN(requestId)) notFound()

  const detail = await adminGetRequestDetail(requestId)
  if (!detail) notFound()

  const { request: req, documentType, client, values, events, assignees } = detail
  const fields = await adminGetDocumentFields(req.documentTypeId)

  const getFieldLabel = (fieldId: number, key: string) =>
    fields.find((f) => f.id === fieldId)?.label ?? key

  return (
    <div className="space-y-6">
      {/* Retour et en-tête */}
      <div className="flex flex-col gap-2">
        <Link
          href="/admin/demandes"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground w-fit"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Retour aux demandes
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Détails de la demande
            </span>
            <h2 className="font-serif text-2xl font-bold text-slate-900 mt-1">
              {documentType?.name ?? "Démarche"}
            </h2>
            <p className="text-sm text-muted-foreground font-mono mt-1">
              Référence : {req.reference} · Créée le {new Date(req.createdAt).toLocaleDateString("fr-FR")} à {new Date(req.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <StatusBadge status={req.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonne de gauche : Informations soumises & Client */}
        <div className="lg:col-span-2 space-y-6">
          {/* Fiche Client */}
          <Card className="p-6">
            <h3 className="font-serif text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> Informations du Client
            </h3>
            <Separator className="my-4" />
            {client ? (
              <div className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Nom complet</p>
                  <p className="font-medium text-slate-900 mt-0.5">{client.name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Adresse e-mail</p>
                  <a href={`mailto:${client.email}`} className="font-medium text-primary underline mt-0.5 inline-flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> {client.email}
                  </a>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Rôle utilisateur</p>
                  <p className="capitalize text-slate-900 mt-0.5">{client.role}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Inscrit le</p>
                  <p className="text-slate-900 mt-0.5">{new Date(client.createdAt).toLocaleDateString("fr-FR")}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Données client introuvables.</p>
            )}
          </Card>

          {/* Formulaire soumis */}
          <Card className="p-6">
            <h3 className="font-serif text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Données et pièces fournies
            </h3>
            <Separator className="my-4" />
            {values.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune donnée n&apos;a été fournie pour cette demande.</p>
            ) : (
              <dl className="space-y-4">
                {values.map((v) => (
                  <div key={v.id} className="flex flex-col gap-1 border-b pb-3 last:border-b-0 last:pb-0">
                    <dt className="text-sm font-semibold text-slate-700">
                      {getFieldLabel(v.fieldId, v.fieldKey)}
                    </dt>
                    <dd className="text-sm text-slate-900 mt-1">
                      {v.fileUrl ? (
                        <a
                          href={v.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-primary hover:underline bg-primary/5 px-3 py-1.5 rounded border border-primary/10 w-fit"
                        >
                          <FileText className="h-4 w-4" aria-hidden="true" />
                          <span className="font-medium">{v.fileName ?? "Fichier joint"}</span>
                          <Download className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                      ) : (
                        <span className="bg-slate-50 px-3 py-2 rounded border border-slate-100 block whitespace-pre-wrap">
                          {v.value ?? "—"}
                        </span>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </Card>
        </div>

        {/* Colonne de droite : Contrôles Admin & Historique */}
        <div className="space-y-6">
          {/* Contrôles interactifs */}
          <RequestAdminControls
            requestId={req.id}
            currentStatus={req.status}
            currentAssigneeId={req.assignedTo}
            assignees={assignees}
          />

          {/* Journal des événements (Historique) */}
          <Card className="p-6">
            <h3 className="font-serif text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" /> Historique d&apos;activité
            </h3>
            <Separator className="my-4" />
            {events.length === 0 ? (
              <p className="text-xs text-muted-foreground">Aucun événement enregistré.</p>
            ) : (
              <ol className="relative border-l border-slate-200 ml-2 space-y-4">
                {events.map((e) => (
                  <li key={e.id} className="mb-4 ml-4">
                    <div className="absolute w-2.5 h-2.5 bg-primary rounded-full -left-[5.5px] mt-1.5 border border-white" />
                    <time className="mb-1 text-[10px] font-normal leading-none text-muted-foreground block">
                      {new Date(e.createdAt).toLocaleString("fr-FR")}
                    </time>
                    <p className="text-sm font-semibold text-slate-900">
                      {e.message ?? e.type}
                    </p>
                    {e.actorName && (
                      <span className="text-xs text-muted-foreground block mt-0.5">
                        Par : {e.actorName}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
