import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { user } from "@/lib/db/schema"
import { and, eq, lte } from "drizzle-orm"
import { headers } from "next/headers"

export type SessionUser = {
  id: string
  name: string
  email: string
  role: string
}

// Returns the current session user (with the freshest role from the DB) or null.
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null

  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      updatedAt: user.updatedAt,
    })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1)

  const dbUser = rows[0]
  if (!dbUser) return null

  const activityRefreshCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)
  if (dbUser.updatedAt <= activityRefreshCutoff) {
    await db
      .update(user)
      .set({ updatedAt: new Date() })
      .where(and(eq(user.id, dbUser.id), lte(user.updatedAt, activityRefreshCutoff)))
  }

  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role,
  }
}

// Throws if not authenticated. Use inside server actions.
export async function requireUser(): Promise<SessionUser> {
  const u = await getSessionUser()
  if (!u) throw new Error("Unauthorized")
  return u
}
