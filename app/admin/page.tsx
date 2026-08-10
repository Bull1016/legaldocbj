import Link from "next/link"
import {
  FolderOpen,
  Users,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  UserCheck,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { adminGetStats, adminGetRequests } from "@/app/actions/admin"
import { StatusBadge } from "@/components/status-badge"
import { getSessionUser } from "@/lib/session"
import { isAdmin } from "@/lib/roles"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const user = (await getSessionUser())!
  const stats = await adminGetStats()
  const allRequests = await adminGetRequests()

  // Get recent 5 requests
  const recentRequests = allRequests.slice(0, 5)
  const isUserAdmin = isAdmin(user.role)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-3xl font-bold tracking-tight">Bonjour, {user.name} 👋</h2>
        <p className="text-muted-foreground">
          Voici un aperçu de l&apos;activité de la plateforme LegalDoc BJ aujourd&apos;hui.
        </p>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Demandes à traiter"
          value={stats.requests.submitted + stats.requests.inReview}
          description="En attente ou en cours de traitement"
          icon={Clock}
          color="text-amber-600 bg-amber-50"
        />
        <StatCard
          title="En attente d'infos"
          value={stats.requests.needInfo}
          description="Demandes nécessitant des précisions client"
          icon={AlertTriangle}
          color="text-blue-600 bg-blue-50"
        />
        <StatCard
          title="Demandes terminées"
          value={stats.requests.completed}
          description="Dossiers finalisés avec succès"
          icon={CheckCircle}
          color="text-emerald-600 bg-emerald-50"
        />
        <StatCard
          title="Utilisateurs inscrits"
          value={stats.users.total}
          description="Comptes clients et agents créés"
          icon={Users}
          color="text-violet-600 bg-violet-50"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Liste des demandes récentes */}
        <Card className="p-6 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif text-xl font-semibold">Demandes récentes</h3>
              <p className="text-xs text-muted-foreground">Dernières démarches soumises par les clients</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1.5">
              <Link href="/admin/demandes">
                Voir tout <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {recentRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
              <FolderOpen className="h-10 w-10 mb-2 text-slate-300" />
              <p className="text-sm">Aucune demande enregistrée pour le moment.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentRequests.map((req) => (
                <div key={req.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                  <div className="min-w-0 pr-4">
                    <p className="font-medium text-sm truncate">{req.documentTypeName}</p>
                    <p className="text-xs text-muted-foreground">
                      Ref: {req.reference} · Client : {req.clientName} ({req.clientEmail})
                    </p>
                    <p className="text-[10px] text-muted-foreground/80 mt-0.5">
                      Soumis le {new Date(req.createdAt).toLocaleDateString("fr-FR")} à {new Date(req.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={req.status} />
                    <Button asChild size="sm" variant="outline" className="h-8 text-xs">
                      <Link href={`/admin/demandes/${req.id}`}>Gérer</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Raccourcis / Quick actions */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-xl font-semibold mb-1">Actions rapides</h3>
            <p className="text-xs text-muted-foreground mb-4">Raccourcis vers les modules de gestion</p>

            <div className="space-y-3">
              <Button asChild variant="outline" className="w-full justify-start gap-2.5 h-10">
                <Link href="/admin/demandes">
                  <FolderOpen className="h-4 w-4 text-slate-500" />
                  Consulter les demandes
                </Link>
              </Button>

              {isUserAdmin && (
                <>
                  <Button asChild variant="outline" className="w-full justify-start gap-2.5 h-10">
                    <Link href="/admin/utilisateurs">
                      <Users className="h-4 w-4 text-slate-500" />
                      Modifier les rôles utilisateurs
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="w-full justify-start gap-2.5 h-10">
                    <Link href="/admin/demarches">
                      <FileText className="h-4 w-4 text-slate-500" />
                      Gérer les démarches & formulaires
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="mt-8 border-t pt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Vous êtes connecté en tant que <span className="font-medium text-foreground">{user.role === "admin" ? "Administrateur" : "Agent"}</span>.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color,
}: {
  title: string
  value: number
  description: string
  icon: any
  color: string
}) {
  return (
    <Card className="p-5 flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
    </Card>
  )
}
