"use server"

import { db } from "@/lib/db"
import { request, requestValue, requestEvent, documentField, documentType } from "@/lib/db/schema"
import { requireUser } from "@/lib/session"
import { and, asc, desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

function generateReference() {
  const y = new Date().getFullYear()
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `LDB-${y}-${rand}`
}

type SubmittedValue = {
  fieldId: number
  fieldKey: string
  value?: string | null
  fileUrl?: string | null
  fileName?: string | null
}

// Create a request for a document type and store submitted field values.
export async function createRequest(input: {
  documentTypeId: number
  values: SubmittedValue[]
  submit: boolean
}): Promise<{ id: number; reference: string }> {
  const user = await requireUser()

  // Validate the document type exists and is active.
  const [docType] = await db
    .select()
    .from(documentType)
    .where(and(eq(documentType.id, input.documentTypeId), eq(documentType.active, true)))
    .limit(1)
  if (!docType) throw new Error("Démarche introuvable")

  // Load fields to validate required ones on submit.
  const fields = await db
    .select()
    .from(documentField)
    .where(eq(documentField.documentTypeId, input.documentTypeId))

  if (input.submit) {
    for (const f of fields) {
      if (!f.required) continue
      const submitted = input.values.find((v) => v.fieldId === f.id)
      const hasValue = submitted && (submitted.value?.trim() || submitted.fileUrl)
      if (!hasValue) throw new Error(`Le champ "${f.label}" est obligatoire`)
    }
  }

  const reference = generateReference()
  const [created] = await db
    .insert(request)
    .values({
      reference,
      userId: user.id,
      documentTypeId: input.documentTypeId,
      status: input.submit ? "submitted" : "draft",
    })
    .returning({ id: request.id })

  const requestId = created.id

  const rows = input.values
    .filter((v) => v.value?.trim() || v.fileUrl)
    .map((v) => ({
      requestId,
      fieldId: v.fieldId,
      fieldKey: v.fieldKey,
      value: v.value ?? null,
      fileUrl: v.fileUrl ?? null,
      fileName: v.fileName ?? null,
    }))
  if (rows.length > 0) await db.insert(requestValue).values(rows)

  await db.insert(requestEvent).values({
    requestId,
    actorId: user.id,
    actorName: user.name,
    type: input.submit ? "submitted" : "created",
    message: input.submit ? "Demande soumise" : "Brouillon créé",
  })

  revalidatePath("/dashboard")
  return { id: requestId, reference }
}

// List the current user's requests with the document type name.
export async function getMyRequests() {
  const user = await requireUser()
  return db
    .select({
      id: request.id,
      reference: request.reference,
      status: request.status,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      documentTypeName: documentType.name,
    })
    .from(request)
    .leftJoin(documentType, eq(request.documentTypeId, documentType.id))
    .where(eq(request.userId, user.id))
    .orderBy(desc(request.createdAt))
}

// Detailed view of one of the current user's requests.
export async function getMyRequestDetail(id: number) {
  const user = await requireUser()
  const [req] = await db
    .select()
    .from(request)
    .where(and(eq(request.id, id), eq(request.userId, user.id)))
    .limit(1)
  if (!req) return null

  const [docType] = await db.select().from(documentType).where(eq(documentType.id, req.documentTypeId)).limit(1)
  const values = await db.select().from(requestValue).where(eq(requestValue.requestId, id))
  const events = await db
    .select()
    .from(requestEvent)
    .where(eq(requestEvent.requestId, id))
    .orderBy(desc(requestEvent.createdAt))

  return { request: req, documentType: docType, values, events }
}

// Client submits a previously saved draft.
export async function submitRequest(id: number) {
  const user = await requireUser()
  const [req] = await db
    .select()
    .from(request)
    .where(and(eq(request.id, id), eq(request.userId, user.id)))
    .limit(1)
  if (!req) throw new Error("Demande introuvable")
  if (req.status !== "draft" && req.status !== "need_info") throw new Error("Cette demande ne peut plus être soumise")

  await db.update(request).set({ status: "submitted", updatedAt: new Date() }).where(eq(request.id, id))
  await db.insert(requestEvent).values({
    requestId: id,
    actorId: user.id,
    actorName: user.name,
    type: "submitted",
    message: "Demande soumise",
  })
  revalidatePath(`/dashboard/demandes/${id}`)
  revalidatePath("/dashboard")
}

// Load fields for the request form (used by the new-request page).
export async function getFieldsForForm(documentTypeId: number) {
  return db
    .select()
    .from(documentField)
    .where(eq(documentField.documentTypeId, documentTypeId))
    .orderBy(asc(documentField.sortOrder), asc(documentField.id))
}
