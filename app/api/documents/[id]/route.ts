import { get } from "@vercel/blob"
import { and, eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auditLog, request, requestValue } from "@/lib/db/schema"
import { getSessionUser } from "@/lib/session"

export async function GET(
  incomingRequest: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const { id } = await params
  const valueId = Number(id)
  if (!Number.isInteger(valueId)) {
    return NextResponse.json({ error: "Document invalide" }, { status: 400 })
  }

  const [document] = await db
    .select({
      valueId: requestValue.id,
      requestId: request.id,
      ownerId: request.userId,
      fileUrl: requestValue.fileUrl,
      fileName: requestValue.fileName,
    })
    .from(requestValue)
    .innerJoin(request, eq(request.id, requestValue.requestId))
    .where(and(eq(requestValue.id, valueId), eq(requestValue.requestId, request.id)))
    .limit(1)

  const canAccess = document && (
    document.ownerId === user.id || user.role === "agent" || user.role === "admin"
  )
  if (!canAccess || !document.fileUrl) {
    return new NextResponse("Document introuvable", { status: 404 })
  }

  const blob = await get(document.fileUrl, { access: "private" })
  if (!blob || blob.statusCode !== 200) {
    return new NextResponse("Document introuvable", { status: 404 })
  }

  await db.insert(auditLog).values({
    actorId: user.id,
    actorName: user.name,
    actorRole: user.role,
    action: "DOCUMENT_ACCESSED",
    entityType: "request_value",
    entityId: String(document.valueId),
    details: JSON.stringify({ requestId: document.requestId, fileName: document.fileName }),
    ipAddress: incomingRequest.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
  })

  return new NextResponse(blob.stream, {
    headers: {
      "Content-Type": blob.blob.contentType,
      "Content-Disposition": blob.blob.contentDisposition,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
