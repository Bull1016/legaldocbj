import { notFound } from "next/navigation"
import { requireAdmin } from "@/app/actions/admin"
import { db } from "@/lib/db"
import { documentType } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { adminGetDocumentFields } from "@/app/actions/admin"
import { DemarcheFieldsEditor } from "@/components/demarche-fields-editor"

export const dynamic = "force-dynamic"

export default async function DemarcheFieldsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()

  const { id } = await params
  const typeId = Number(id)
  if (Number.isNaN(typeId)) notFound()

  // Load the document type
  const [docType] = await db
    .select()
    .from(documentType)
    .where(eq(documentType.id, typeId))
    .limit(1)

  if (!docType) notFound()

  // Load fields
  const fields = await adminGetDocumentFields(typeId)

  return (
    <DemarcheFieldsEditor
      documentTypeId={typeId}
      documentTypeName={docType.name}
      initialFields={fields}
    />
  )
}
