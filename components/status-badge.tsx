import { STATUS_LABELS, STATUS_STYLES, type RequestStatus } from "@/lib/status"
import { cn } from "@/lib/utils"

export function StatusBadge({ status }: { status: string }) {
  const s = status as RequestStatus
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLES[s] ?? "bg-muted text-muted-foreground",
      )}
    >
      {STATUS_LABELS[s] ?? status}
    </span>
  )
}
