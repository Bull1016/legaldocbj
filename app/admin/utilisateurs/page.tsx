import { Card } from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { adminGetUsers, requireAdmin } from "@/app/actions/admin"
import { getSessionUser } from "@/lib/session"
import { UserRoleSelect } from "@/components/user-role-select"
import { Users, ShieldAlert } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminUsersPage() {
  // Direct block if not an administrator
  const currentUser = (await getSessionUser())!
  await requireAdmin()

  const users = await adminGetUsers()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-bold tracking-tight">Utilisateurs & Rôles</h2>
        <p className="text-muted-foreground">
          Gérez les privilèges d&apos;accès et les rôles de l&apos;ensemble des utilisateurs de la plateforme.
        </p>
      </div>

      <Card className="overflow-hidden">
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            <Users className="h-12 w-12 mb-3 text-slate-300" />
            <p className="text-base font-medium">Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="pl-6 font-semibold text-slate-700">Nom complet</TableHead>
                <TableHead className="font-semibold text-slate-700">Adresse e-mail</TableHead>
                <TableHead className="font-semibold text-slate-700">Inscrit le</TableHead>
                <TableHead className="font-semibold text-slate-700">Rôle actuel</TableHead>
                <TableHead className="pr-6 text-right font-semibold text-slate-700">Modifier le rôle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} className="hover:bg-slate-50/50">
                  <TableCell className="pl-6">
                    <span className="font-medium text-slate-900">{u.name}</span>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {u.email}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {new Date(u.createdAt).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {u.role}
                    </span>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <div className="flex justify-end">
                      <UserRoleSelect
                        userId={u.id}
                        currentRole={u.role}
                        currentUserId={currentUser.id}
                      />
                    </div>
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
