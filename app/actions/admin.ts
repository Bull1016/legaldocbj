"use server"

import { db } from "@/lib/db"
import {
  user,
  request,
  requestValue,
  requestEvent,
  documentType,
  documentField,
} from "@/lib/db/schema"
import { requireUser } from "@/lib/session"
import { isStaff, isAdmin } from "@/lib/roles"
import { and, asc, desc, eq, count } from "drizzle-orm"
import { revalidatePath } from "next/cache"

// Check staff membership (admin or agent)
export async function requireStaff() {
  const me = await requireUser()
  if (!isStaff(me.role)) {
    throw new Error("Accès interdit : vous devez être membre du personnel")
  }
  return me
}

// Check admin role
export async function requireAdmin() {
  const me = await requireUser()
  if (!isAdmin(me.role)) {
    throw new Error("Accès interdit : vous devez être administrateur")
  }
  return me
}

// 1. Get statistics for admin dashboard
export async function adminGetStats() {
  await requireStaff()

  // Get total requests
  const [totalReqs] = await db.select({ value: count() }).from(request)
  const [submittedReqs] = await db
    .select({ value: count() })
    .from(request)
    .where(eq(request.status, "submitted"))
  const [inReviewReqs] = await db
    .select({ value: count() })
    .from(request)
    .where(eq(request.status, "in_review"))
  const [needInfoReqs] = await db
    .select({ value: count() })
    .from(request)
    .where(eq(request.status, "need_info"))
  const [completedReqs] = await db
    .select({ value: count() })
    .from(request)
    .where(eq(request.status, "completed"))

  // Get total users
  const [totalUsers] = await db.select({ value: count() }).from(user)

  // Get total document types
  const [totalTypes] = await db.select({ value: count() }).from(documentType)

  return {
    requests: {
      total: totalReqs?.value ?? 0,
      submitted: submittedReqs?.value ?? 0,
      inReview: inReviewReqs?.value ?? 0,
      needInfo: needInfoReqs?.value ?? 0,
      completed: completedReqs?.value ?? 0,
    },
    users: {
      total: totalUsers?.value ?? 0,
    },
    documentTypes: {
      total: totalTypes?.value ?? 0,
    },
  }
}

// 2. Get list of all requests
export async function adminGetRequests() {
  await requireStaff()

  return db
    .select({
      id: request.id,
      reference: request.reference,
      status: request.status,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      documentTypeName: documentType.name,
      clientName: user.name,
      clientEmail: user.email,
      assignedToId: request.assignedTo,
    })
    .from(request)
    .leftJoin(documentType, eq(request.documentTypeId, documentType.id))
    .leftJoin(user, eq(request.userId, user.id))
    .orderBy(desc(request.createdAt))
}

// 3. Get request details (including values, events, etc.)
export async function adminGetRequestDetail(id: number) {
  await requireStaff()

  const [req] = await db.select().from(request).where(eq(request.id, id)).limit(1)
  if (!req) return null

  const [docType] = await db.select().from(documentType).where(eq(documentType.id, req.documentTypeId)).limit(1)
  const [client] = await db.select().from(user).where(eq(user.id, req.userId)).limit(1)
  const values = await db.select().from(requestValue).where(eq(requestValue.requestId, id))
  const events = await db
    .select()
    .from(requestEvent)
    .where(eq(requestEvent.requestId, id))
    .orderBy(desc(requestEvent.createdAt))

  // Get list of potential assignees (all admins and agents)
  const staffMembers = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    })
    .from(user)
    .orderBy(asc(user.name))

  const assignees = staffMembers.filter((u) => isStaff(u.role))

  return {
    request: req,
    documentType: docType,
    client,
    values,
    events,
    assignees,
  }
}

// 4. Update request status
export async function adminUpdateRequestStatus(id: number, status: string, message: string) {
  const me = await requireStaff()

  // Ensure request exists
  const [req] = await db.select().from(request).where(eq(request.id, id)).limit(1)
  if (!req) throw new Error("Demande introuvable")

  await db
    .update(request)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(request.id, id))

  await db.insert(requestEvent).values({
    requestId: id,
    actorId: me.id,
    actorName: me.name,
    type: status,
    message: message || `Changement de statut : ${status}`,
  })

  revalidatePath(`/admin/demandes/${id}`)
  revalidatePath("/admin")
  revalidatePath("/dashboard")
  revalidatePath(`/dashboard/demandes/${id}`)
}

// 5. Assign request to staff member
export async function adminAssignRequest(id: number, assignedToId: string | null) {
  const me = await requireStaff()

  // Ensure request exists
  const [req] = await db.select().from(request).where(eq(request.id, id)).limit(1)
  if (!req) throw new Error("Demande introuvable")

  let assigneeName = "Non assigné"
  if (assignedToId) {
    const [assignee] = await db.select().from(user).where(eq(user.id, assignedToId)).limit(1)
    if (!assignee) throw new Error("Agent désigné introuvable")
    assigneeName = assignee.name
  }

  await db
    .update(request)
    .set({
      assignedTo: assignedToId,
      updatedAt: new Date(),
    })
    .where(eq(request.id, id))

  await db.insert(requestEvent).values({
    requestId: id,
    actorId: me.id,
    actorName: me.name,
    type: "assigned",
    message: assignedToId ? `Assignée à ${assigneeName}` : "Demande désassignée",
  })

  revalidatePath(`/admin/demandes/${id}`)
  revalidatePath("/admin")
  revalidatePath("/dashboard")
}

// 6. Get all users (Admin only)
export async function adminGetUsers() {
  await requireAdmin()

  return db.select().from(user).orderBy(desc(user.createdAt))
}

// 7. Update user role (Admin only)
export async function adminUpdateUserRole(userId: string, newRole: string) {
  const me = await requireAdmin()

  if (userId === me.id) {
    throw new Error("Vous ne pouvez pas modifier votre propre rôle")
  }

  const [targetUser] = await db.select().from(user).where(eq(user.id, userId)).limit(1)
  if (!targetUser) throw new Error("Utilisateur introuvable")

  await db
    .update(user)
    .set({
      role: newRole,
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId))

  revalidatePath("/admin/utilisateurs")
  revalidatePath("/admin")
}

// 8. Get all document types and their field counts
export async function adminGetDocumentTypes() {
  await requireAdmin()

  const list = await db.select().from(documentType).orderBy(asc(documentType.name))

  const results = []
  for (const doc of list) {
    const [fieldCount] = await db
      .select({ value: count() })
      .from(documentField)
      .where(eq(documentField.documentTypeId, doc.id))

    results.push({
      ...doc,
      fieldCount: fieldCount?.value ?? 0,
    })
  }

  return results
}

// 9. Create a new document type (Admin only)
export async function adminCreateDocumentType(input: {
  name: string
  slug: string
  description?: string
  category?: string
  price: number // in cents
  active: boolean
}) {
  const me = await requireAdmin()

  // Verify slug uniqueness
  const [existing] = await db
    .select()
    .from(documentType)
    .where(eq(documentType.slug, input.slug))
    .limit(1)

  if (existing) {
    throw new Error(`Le slug "${input.slug}" est déjà utilisé par une autre démarche.`)
  }

  const [inserted] = await db
    .insert(documentType)
    .values({
      name: input.name,
      slug: input.slug,
      description: input.description ?? null,
      category: input.category ?? null,
      price: input.price,
      active: input.active,
      createdBy: me.id,
    })
    .returning()

  revalidatePath("/admin/demarches")
  revalidatePath("/dashboard/nouvelle-demande")
  revalidatePath("/")
  return inserted
}

// 10. Update document type (Admin only)
export async function adminUpdateDocumentType(
  id: number,
  input: {
    name: string
    slug: string
    description?: string
    category?: string
    price: number
    active: boolean
  }
) {
  await requireAdmin()

  // Verify slug uniqueness against other types
  const list = await db.select().from(documentType).where(eq(documentType.slug, input.slug))
  const other = list.find((d) => d.id !== id)
  if (other) {
    throw new Error(`Le slug "${input.slug}" est déjà utilisé par une autre démarche.`)
  }

  await db
    .update(documentType)
    .set({
      name: input.name,
      slug: input.slug,
      description: input.description ?? null,
      category: input.category ?? null,
      price: input.price,
      active: input.active,
      updatedAt: new Date(),
    })
    .where(eq(documentType.id, id))

  revalidatePath("/admin/demarches")
  revalidatePath(`/services/${input.slug}`)
  revalidatePath("/dashboard/nouvelle-demande")
  revalidatePath("/")
}

// 11. Get fields for a document type
export async function adminGetDocumentFields(documentTypeId: number) {
  await requireAdmin()

  return db
    .select()
    .from(documentField)
    .where(eq(documentField.documentTypeId, documentTypeId))
    .orderBy(asc(documentField.sortOrder), asc(documentField.id))
}

// 12. Save all fields for a document type (Admin only)
// This completely replaces existing fields with the new list to keep it simple and robust.
export async function adminSaveDocumentFields(
  documentTypeId: number,
  fields: {
    label: string
    fieldKey: string
    fieldType: string
    required: boolean
    options?: string
    helpText?: string
    sortOrder: number
  }[]
) {
  await requireAdmin()

  // Delete all old fields
  await db.delete(documentField).where(eq(documentField.documentTypeId, documentTypeId))

  // Insert new ones
  if (fields.length > 0) {
    const rows = fields.map((f) => ({
      documentTypeId,
      label: f.label,
      fieldKey: f.fieldKey,
      fieldType: f.fieldType,
      required: f.required,
      options: f.options ?? null,
      helpText: f.helpText ?? null,
      sortOrder: f.sortOrder,
    }))

    await db.insert(documentField).values(rows)
  }

  revalidatePath("/admin/demarches")
  revalidatePath("/dashboard/nouvelle-demande")
}
