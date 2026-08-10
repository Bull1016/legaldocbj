"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { submitRequest } from "@/app/actions/requests"
import { toast } from "sonner"

export function SubmitDraftButton({ requestId }: { requestId: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function onClick() {
    setLoading(true)
    try {
      await submitRequest(requestId)
      toast.success("Demande soumise avec succès")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={onClick} disabled={loading} size="sm">
      {loading ? "Soumission..." : "Soumettre la demande"}
    </Button>
  )
}
