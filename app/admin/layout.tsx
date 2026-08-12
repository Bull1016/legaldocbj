import { redirect } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, FolderOpen, Users, FileText, ArrowLeft } from "lucide-react"
import { getSessionUser } from "@/lib/session"
import { isStaff, isAdmin, ROLE_LABELS } from "@/lib/roles"
import { Logo } from "@/components/brand"
import { UserMenu } from "@/components/user-menu"

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
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-slate-900 text-slate-100 md:flex">
        <div className="flex h-16 items-center border-b border-slate-800 px-5">
          <Link href="/" aria-label="Accueil">
            <Logo className="text-white [&_span]:text-white" />
          </Link>
        </div>

        <div className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Espace Professionnel
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          ))}
        </nav>
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
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          ))}
          <Link
            href="/dashboard"
            className="flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground ml-auto border-l pl-3"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Client
          </Link>
        </div>

        <main className="flex-1 p-4 md:p-6 bg-slate-50/50">{children}</main>
      </div>
    </div>
  )
}
