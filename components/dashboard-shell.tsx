"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Logo } from "@/components/brand"
import { UserMenu } from "@/components/user-menu"
import { ROLE_LABELS } from "@/lib/roles"
import { cn } from "@/lib/utils"
import type { SessionUser } from "@/lib/session"
import type { LucideIcon } from "lucide-react"

export type NavItem = {
  href: string
  label: string
  icon: LucideIcon
}

export function DashboardShell({
  user,
  nav,
  title,
  action,
  children,
}: {
  user: SessionUser
  nav: NavItem[]
  title: string
  action?: React.ReactNode
  /** @deprecated — pass currentPath via DashboardShell no longer needed, usePathname() is used internally */
  currentPath?: string
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex h-16 items-center border-b border-sidebar-border px-5">
          <Link href="/" aria-label="Accueil">
            <Logo className="text-sidebar-foreground [&_span]:text-sidebar-foreground" />
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-3" aria-label="Navigation tableau de bord">
          {nav.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3 text-xs text-sidebar-foreground/60">
          Rôle : {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] ?? user.role}
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between gap-4 border-b border-border bg-card px-4 md:px-6">
          <h1 className="truncate font-serif text-xl font-semibold">{title}</h1>
          <div className="flex items-center gap-3">
            {action}
            <UserMenu user={user} />
          </div>
        </header>

        {/* Mobile nav */}
        <div className="flex gap-1 overflow-x-auto border-b border-border bg-card px-4 py-2 md:hidden">
          {nav.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-accent text-accent-foreground font-semibold"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                aria-current={active ? "page" : undefined}
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            )
          })}
        </div>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
