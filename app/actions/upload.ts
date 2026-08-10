"use server"

import { put } from "@vercel/blob"
import { requireUser } from "@/lib/session"

// Uploads a private file to Vercel Blob and returns its URL + name.
// Called from the request form for `file` type fields.
export async function uploadFile(formData: FormData): Promise<{ url: string; name: string }> {
  const user = await requireUser()
  const file = formData.get("file") as File | null
  if (!file || file.size === 0) throw new Error("Aucun fichier fourni")
  if (file.size > 10 * 1024 * 1024) throw new Error("Le fichier dépasse 10 Mo")

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
  const blob = await put(`requests/${user.id}/${Date.now()}-${safeName}`, file, {
    access: "public",
    addRandomSuffix: true,
  })

  return { url: blob.url, name: file.name }
}
