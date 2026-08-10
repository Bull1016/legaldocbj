import { requireAdmin, adminGetDocumentTypes } from "@/app/actions/admin"
import { DemarchesManager } from "@/components/demarches-manager"

export const dynamic = "force-dynamic"

export default async function AdminDemarchesPage() {
  await requireAdmin()
  const demarches = await adminGetDocumentTypes()

  return <DemarchesManager initialDemarches={demarches} />
}
