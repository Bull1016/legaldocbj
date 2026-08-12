export type RequestStatus =
  | "draft"
  | "submitted"
  | "in_review"
  | "need_info"
  | "completed"
  | "rejected"

export const REQUEST_STATUSES: RequestStatus[] = [
  "draft",
  "submitted",
  "in_review",
  "need_info",
  "completed",
  "rejected",
]

export const STATUS_LABELS: Record<RequestStatus, string> = {
  draft: "Brouillon",
  submitted: "Soumise",
  in_review: "En traitement",
  need_info: "Infos requises",
  completed: "Terminée",
  rejected: "Rejetée",
}

// Tailwind classes keyed by status for badges (semantic tokens only).
export const STATUS_STYLES: Record<RequestStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-secondary text-secondary-foreground",
  in_review: "bg-accent text-accent-foreground",
  need_info: "bg-warning/15 text-warning",
  completed: "bg-success/15 text-success",
  rejected: "bg-destructive/15 text-destructive",
}

export const FIELD_TYPES = [
  { value: "text", label: "Texte court" },
  { value: "textarea", label: "Texte long" },
  { value: "date", label: "Date" },
  { value: "number", label: "Nombre" },
  { value: "select", label: "Liste déroulante" },
  { value: "file", label: "Fichier / pièce jointe" },
] as const

export function formatPrice(cents: number): string {
  if (!cents) return "Gratuit"
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "FCFA",
  }).format(cents)
}
