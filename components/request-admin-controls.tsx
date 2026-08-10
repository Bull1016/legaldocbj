"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { adminAssignRequest, adminUpdateRequestStatus } from "@/app/actions/admin"
import { STATUS_LABELS } from "@/lib/status"

type Assignee = {
  id: string
  name: string
  email: string
  role: string
}

export function RequestAdminControls({
  requestId,
  currentStatus,
  currentAssigneeId,
  assignees,
}: {
  requestId: number
  currentStatus: string
  currentAssigneeId: string | null
  assignees: Assignee[]
}) {
  const router = useRouter()
  const [loadingAssign, setLoadingAssign] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState(false)

  const [assigneeId, setAssigneeId] = useState<string>(currentAssigneeId ?? "")
  const [status, setStatus] = useState<string>(currentStatus)
  const [message, setMessage] = useState<string>("")

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault()
    setLoadingAssign(true)
    try {
      const targetId = assigneeId === "" ? null : assigneeId
      await adminAssignRequest(requestId, targetId)
      toast.success("Assignation mise à jour")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'assignation")
    } finally {
      setLoadingAssign(false)
    }
  }

  async function handleStatus(e: React.FormEvent) {
    e.preventDefault()
    setLoadingStatus(true)
    try {
      await adminUpdateRequestStatus(requestId, status, message)
      toast.success("Statut mis à jour avec succès")
      setMessage("")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la mise à jour du statut")
    } finally {
      setLoadingStatus(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Assignation */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-serif text-lg font-semibold mb-3">Assignation de l&apos;agent</h3>
        <form onSubmit={handleAssign} className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="assignee-select">Agent en charge</Label>
            <select
              id="assignee-select"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">-- Non assigné --</option>
              {assignees.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.role === "admin" ? "Admin" : "Agent"})
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" disabled={loadingAssign} className="w-full">
            {loadingAssign ? "Mise à jour..." : "Enregistrer l'assignation"}
          </Button>
        </form>
      </div>

      {/* Changement de statut */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-serif text-lg font-semibold mb-3">Mise à jour du statut</h3>
        <form onSubmit={handleStatus} className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="status-select">Nouveau statut</Label>
            <select
              id="status-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="message-textarea">Note / Message pour le client</Label>
            <Textarea
              id="message-textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ex: Vos documents sont conformes, nous procédons à la finalisation."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Ce message figurera dans l&apos;historique de la demande visible par le client.
            </p>
          </div>

          <Button type="submit" disabled={loadingStatus} className="w-full">
            {loadingStatus ? "Enregistrement..." : "Mettre à jour le statut"}
          </Button>
        </form>
      </div>
    </div>
  )
}
