import Link from "next/link"
import { LayoutDashboard, FilePlus2, FolderOpen, Plus, Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DashboardShell } from "@/components/dashboard-shell"
import { StatusBadge } from "@/components/status-badge"
import { getSessionUser } from "@/lib/session"
import { getMyRequests } from "@/app/actions/requests"

const clientNav = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/dashboard/nouvelle-demande", label: "Nouvelle demande", icon: FilePlus2 },
]

export default async function ClientDashboardPage() {
  const user = (await getSessionUser())!
  const requests = await getMyRequests()

  const active = requests.filter((r) => !["completed", "rejected"].includes(r.status)).length
  const completed = requests.filter((r) => r.status === "completed").length

  return (
    <DashboardShell
      user={user}
      nav={clientNav}
      currentPath="/dashboard"
      title="Tableau de bord"
      action={
        <Button asChild size="sm">
          <Link href="/dashboard/nouvelle-demande">
            <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" /> Nouvelle demande
          </Link>
        </Button>
      }
    >
      <p className="mb-6 text-muted-foreground">
        Bonjour {user.name.split(" ")[0]}, retrouvez ici toutes vos démarches.
      </p>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Demandes actives" value={active} icon={FolderOpen} />
        <StatCard label="Terminées" value={completed} icon={LayoutDashboard} />
        <StatCard label="Total" value={requests.length} icon={Inbox} />
      </div>

      <h2 className="mb-3 font-serif text-lg font-semibold">Mes demandes</h2>
      {requests.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-12 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-accent text-accent-foreground">
            <Inbox className="h-6 w-6" aria-hidden="true" />
          </span>
          <p className="text-muted-foreground">Vous n&apos;avez pas encore de demande.</p>
          <Button asChild>
            <Link href="/dashboard/nouvelle-demande">Créer ma première demande</Link>
          </Button>
        </Card>
      ) : (
        <Card className="divide-y divide-border p-0">
          {requests.map((r) => (
            <Link
              key={r.id}
              href={`/dashboard/demandes/${r.id}`}
              className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-accent/40"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{r.documentTypeName ?? "Démarche"}</p>
                <p className="text-xs text-muted-foreground">
                  {r.reference} · {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <StatusBadge status={r.status} />
            </Link>
          ))}
        </Card>
      )}
    </DashboardShell>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: number
  icon: typeof LayoutDashboard
}) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div>
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </Card>
  )
}
