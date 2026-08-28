"use server"

import { db } from "@/lib/db"
import { legalAdvice } from "@/lib/db/schema"
import { getSessionUser } from "@/lib/session"
import { revalidatePath } from "next/cache"

export async function createLegalAdviceAction(input: {
  subject: string
  category: string
  description: string
}) {
  const user = await getSessionUser()
  if (!user) {
    return { success: false as const, code: "unauthorized" as const }
  }

  const subject = input.subject.trim()
  const description = input.description.trim()

  if (!subject || !description) {
    return {
      success: false as const,
      code: "invalid_input" as const,
      error: "Le sujet et la description sont obligatoires.",
    }
  }

  const [created] = await db
    .insert(legalAdvice)
    .values({
      userId: user.id,
      subject,
      category: input.category || "Question Juridique",
      description,
      status: "pending",
    })
    .returning({ id: legalAdvice.id })

  revalidatePath("/dashboard")
  return { success: true as const, id: created.id }
}
