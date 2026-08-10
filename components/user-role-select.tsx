"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { adminUpdateUserRole } from "@/app/actions/admin"
import { ROLE_LABELS } from "@/lib/roles"

export function UserRoleSelect({
  userId,
  currentRole,
  currentUserId,
}: {
  userId: string
  currentRole: string
  currentUserId: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState(currentRole)

  const isSelf = userId === currentUserId

  async function handleRoleChange(newRole: string) {
    setLoading(true)
    try {
      await adminUpdateUserRole(userId, newRole)
      setRole(newRole)
      toast.success("Rôle utilisateur mis à jour")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur de mise à jour")
      setRole(currentRole) // reset
    } finally {
      setLoading(false)
    }
  }

  if (isSelf) {
    return (
      <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-700 rounded border">
        {ROLE_LABELS[role as keyof typeof ROLE_LABELS] ?? role} (Vous)
      </span>
    )
  }

  return (
    <select
      value={role}
      disabled={loading}
      onChange={(e) => handleRoleChange(e.target.value)}
      className="flex h-9 w-40 rounded-md border border-input bg-background px-2.5 py-1 text-xs ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {Object.entries(ROLE_LABELS).map(([key, label]) => (
        <option key={key} value={key}>
          {label}
        </option>
      ))}
    </select>
  )
}
