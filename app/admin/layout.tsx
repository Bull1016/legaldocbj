import { redirect } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, FolderOpen, Users, FileText, ArrowLeft } from "lucide-react"
import { getSessionUser } from "@/lib/session"
import { isStaff, isAdmin, ROLE_LABELS } from "@/lib/roles"
import { Logo } from "@/components/brand"
import { UserMenu } from "@/components/user-menu"
import { AdminNav, AdminNavMobile } from "@/components/admin-nav"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()

  if (!user) {
    redirect("/sign-in?next=/admin")
  }

  if (!isStaff(user.role)) {
    redirect("/dashboard")
  }

  const isUserAdmin = isAdmin(user.role)

  const adminNav = [
    { href: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard },
    { href: "/admin/demandes", label: "Toutes les demandes", icon: FolderOpen },
    ...(isUserAdmin
      ? [
          { href: "/admin/utilisateurs", label: "Utilisateurs & Rôles", icon: Users },
          { href: "/admin/demarches", label: "Gestion des démarches", icon: FileText },
        ]
      : []),
  ]

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Sidebar de l'Admin */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex h-16 items-center border-b border-sidebar-border px-5">
          <Link href="/" aria-label="Accueil">
            <Logo className="text-sidebar-foreground [&_span]:text-sidebar-foreground" />
          </Link>
        </div>

        <div className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
          Espace Professionnel
        </div>

        <AdminNav items={adminNav} />
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between gap-4 border-b border-border bg-card px-4 md:px-6">
          <div className="flex items-center gap-2">
            <span className="rounded bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Back-Office
            </span>
          </div>
          <div className="flex items-center gap-3">
            <UserMenu user={user} />
          </div>
        </header>

        {/* Navigation mobile */}
        <div className="flex gap-1 overflow-x-auto border-b border-border bg-card px-4 py-2 md:hidden">
          <AdminNavMobile items={adminNav} />
          <Link
            href="/dashboard"
            className="flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground ml-auto border-l pl-3"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Client
          </Link>
        </div>

        <main className="flex-1 p-4 md:p-6 bg-background">{children}</main>
      </div>
    </div>
  )
}
