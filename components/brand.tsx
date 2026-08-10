import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-serif text-lg font-semibold tracking-tight", className)}>
      <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 3v18M6 9l6-6 6 6M5 9h14l-1.5 6a3 3 0 0 1-2.9 2.2H9.4A3 3 0 0 1 6.5 15L5 9Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span>
        LegalDoc<span className="text-primary"> BJ</span>
      </span>
    </span>
  )
}
