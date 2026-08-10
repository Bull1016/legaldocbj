import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getSessionUser } from "@/lib/session"
import { AuthForm } from "@/components/auth-form"

export default async function SignUpPage() {
  const user = await getSessionUser()
  if (user) redirect("/dashboard")
  return (
    <Suspense>
      <AuthForm mode="sign-up" />
    </Suspense>
  )
}
