import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/session"
import { isStaff } from "@/lib/roles"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  
  if (!user) redirect("/sign-in?next=/dashboard")
  if (isStaff(user.role)) redirect("/admin")

  return <>{children}</>
}
