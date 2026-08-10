import { db } from "@/lib/db"
import { documentType, documentField } from "@/lib/db/schema"
import { and, asc, eq } from "drizzle-orm"

// Public: list active document types (the service catalogue).
export async function getActiveDocumentTypes() {
  return db
    .select()
    .from(documentType)
    .where(eq(documentType.active, true))
    .orderBy(asc(documentType.name))
}

export async function getDocumentTypeBySlug(slug: string) {
  const rows = await db
    .select()
    .from(documentType)
    .where(and(eq(documentType.slug, slug), eq(documentType.active, true)))
    .limit(1)
  return rows[0] ?? null
}

export async function getFieldsForDocumentType(documentTypeId: number) {
  return db
    .select()
    .from(documentField)
    .where(eq(documentField.documentTypeId, documentTypeId))
    .orderBy(asc(documentField.sortOrder), asc(documentField.id))
}
