import Link from "next/link"
import { FolderOpen, Eye, User, Calendar, Tag } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { adminGetRequests } from "@/app/actions/admin"
import { StatusBadge } from "@/components/status-badge"

export const dynamic = "force-dynamic"

export default async function AdminRequestsPage() {
  const requests = await adminGetRequests()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-bold tracking-tight">Gestion des demandes</h2>
        <p className="text-muted-foreground">
          Consultez et traitez l&apos;ensemble des demandes soumises par les utilisateurs.
        </p>
      </div>

      <Card className="overflow-hidden">
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            <FolderOpen className="h-12 w-12 mb-3 text-slate-300" />
            <p className="text-base font-medium">Aucune demande trouvée</p>
            <p className="text-sm text-muted-foreground mt-1">
              Les demandes soumises par les clients apparaîtront ici.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="pl-6 font-semibold text-slate-700">Référence</TableHead>
                <TableHead className="font-semibold text-slate-700">Démarche</TableHead>
                <TableHead className="font-semibold text-slate-700">Client</TableHead>
                <TableHead className="font-semibold text-slate-700">Date de création</TableHead>
                <TableHead className="font-semibold text-slate-700">Statut</TableHead>
                <TableHead className="pr-6 text-right font-semibold text-slate-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id} className="hover:bg-slate-50/50">
                  <TableCell className="pl-6 font-mono text-xs font-semibold text-slate-600">
                    {req.reference}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">
                    {req.documentTypeName || "Démarche inconnue"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-900">{req.clientName}</span>
                      <span className="text-xs text-muted-foreground">{req.clientEmail}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 text-sm">
                    {new Date(req.createdAt).toLocaleDateString("fr-FR")} à{" "}
                    {new Date(req.createdAt).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={req.status} />
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <Button asChild size="sm" variant="outline" className="gap-1.5 h-8">
                      <Link href={`/admin/demandes/${req.id}`}>
                        <Eye className="h-3.5 w-3.5" /> Gérer
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}
