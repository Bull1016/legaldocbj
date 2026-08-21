import { db } from "@/lib/db"
import { auditLog } from "@/lib/db/schema"

export async function createAuditLog({
  actorId,
  actorName,
  actorRole,
  action,
  entityType,
  entityId,
  details,
  ipAddress,
}: {
  actorId: string
  actorName?: string | null
  actorRole: string
  action: string
  entityType: string
  entityId?: string | number | null
  details?: Record<string, unknown> | string | null
  ipAddress?: string | null
}) {
  try {
    const detailsStr = typeof details === "object" ? JSON.stringify(details) : details
    await db.insert(auditLog).values({
      actorId,
      actorName: actorName || "Utilisateur",
      actorRole,
      action,
      entityType,
      entityId: entityId ? String(entityId) : null,
      details: detailsStr || null,
      ipAddress: ipAddress || null,
    })
  } catch (error) {
    console.error("Failed to create audit log:", error)
  }
}
