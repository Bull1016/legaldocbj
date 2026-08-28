"use server"

import { db } from "@/lib/db"
import { legalAdvice } from "@/lib/db/schema"
import { requireUser } from "@/lib/session"
import { revalidatePath } from "next/cache"

export async function createLegalAdviceAction(input: {
  subject: string
  category: string
  description: string
}) {
  const user = await requireUser()

  if (!input.subject || !input.description) {
    throw new Error("Le sujet et la description sont obligatoires.")
  }

  const [created] = await db
    .insert(legalAdvice)
    .values({
      userId: user.id,
      subject: input.subject,
      category: input.category || "Question Juridique",
      description: input.description,
      status: "pending",
    })
    .returning({ id: legalAdvice.id })

  revalidatePath("/dashboard")
  return created
}
