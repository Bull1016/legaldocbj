import Link from "next/link"
import { FileText, ArrowRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { formatPrice } from "@/lib/status"

type Service = {
  id: number
  name: string
  slug: string
  description: string | null
  category: string | null
  price: number
}

export function ServiceCard({ service, href }: { service: Service; href: string }) {
  return (
    <Link href={href} className="group">
      <Card className="flex h-full flex-col gap-4 p-6 transition-all hover:border-primary/40 hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-accent text-accent-foreground">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </span>
          {service.category && (
            <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
              {service.category}
            </span>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-serif text-lg font-semibold text-balance">{service.name}</h3>
          {service.description && (
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{service.description}</p>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-border pt-4">
          <span className="text-sm font-semibold">{formatPrice(service.price)}</span>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
            Commencer
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </div>
      </Card>
    </Link>
  )
}
