// Centralized role & permission definitions for the MVP.
// Roles were auto-detected from the requirements:
//   - admin : manages everything (users, roles, document types, all requests)
//   - agent : processes assigned requests, can read all requests, cannot manage roles or document types
//   - client: creates and tracks their own requests

export type Role = "admin" | "agent" | "client"

export const ROLES: Role[] = ["admin", "agent", "client"]

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrateur",
  agent: "Agent",
  client: "Client",
}

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  admin: "Accès complet : utilisateurs, rôles, types de documents et toutes les demandes.",
  agent: "Traite les demandes assignées et consulte l'ensemble des demandes.",
  client: "Crée et suit ses propres demandes.",
}

export type Permission =
  | "requests.view.own"
  | "requests.view.all"
  | "requests.create"
  | "requests.process"
  | "requests.assign"
  | "documentTypes.manage"
  | "users.manage"
  | "roles.manage"
  | "backoffice.access"

const PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    "requests.view.own",
    "requests.view.all",
    "requests.create",
    "requests.process",
    "requests.assign",
    "documentTypes.manage",
    "users.manage",
    "roles.manage",
    "backoffice.access",
  ],
  agent: [
    "requests.view.all",
    "requests.process",
    "backoffice.access",
  ],
  client: ["requests.view.own", "requests.create"],
}

export function hasPermission(role: string | undefined | null, permission: Permission): boolean {
  if (!role) return false
  const perms = PERMISSIONS[role as Role]
  return perms ? perms.includes(permission) : false
}

export function isStaff(role: string | undefined | null): boolean {
  return role === "admin" || role === "agent"
}

export function isAdmin(role: string | undefined | null): boolean {
  return role === "admin"
}
