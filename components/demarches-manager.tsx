"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Edit2, Sliders, Save, X, FileText, Check, AlertCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { adminCreateDocumentType, adminUpdateDocumentType } from "@/app/actions/admin"
import { formatPrice } from "@/lib/status"
import Link from "next/link"

type DocTypeItem = {
  id: number
  name: string
  slug: string
  description: string | null
  category: string | null
  price: number
  active: boolean
  fieldCount: number
}

export function DemarchesManager({ initialDemarches }: { initialDemarches: DocTypeItem[] }) {
  const router = useRouter()
  const [demarches, setDemarches] = useState<DocTypeItem[]>(initialDemarches)

  // Form States
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [priceInEuros, setPriceInEuros] = useState("0")
  const [active, setActive] = useState(true)

  function openCreate() {
    setEditingId(null)
    setName("")
    setSlug("")
    setDescription("")
    setCategory("")
    setPriceInEuros("0")
    setActive(true)
    setFormOpen(true)
  }

  function openEdit(item: DocTypeItem) {
    setEditingId(item.id)
    setName(item.name)
    setSlug(item.slug)
    setDescription(item.description ?? "")
    setCategory(item.category ?? "")
    setPriceInEuros((item.price / 100).toString())
    setActive(item.active)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingId(null)
  }

  // Auto-generate slug from name
  function handleNameChange(val: string) {
    setName(val)
    if (!editingId) {
      const generated = val
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove accents
        .replace(/[^a-z0-9]+/g, "-") // replace spaces/chars with hyphen
        .replace(/(^-|-$)+/g, "") // trim hyphen from ends
      setSlug(generated)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("Le nom est obligatoire.")
      return
    }
    if (!slug.trim() || !/^[a-z0-9-]+$/.test(slug)) {
      toast.error("Le slug est incorrect (uniquement lettres minuscules, chiffres et tirets).")
      return
    }

    const priceCents = Math.round(parseFloat(priceInEuros) * 100)
    if (isNaN(priceCents) || priceCents < 0) {
      toast.error("Le prix doit être un nombre positif.")
      return
    }

    setLoading(true)
    try {
      if (editingId) {
        await adminUpdateDocumentType(editingId, {
          name,
          slug,
          description,
          category,
          price: priceCents,
          active,
        })
        toast.success("Démarche mise à jour !")
      } else {
        await adminCreateDocumentType({
          name,
          slug,
          description,
          category,
          price: priceCents,
          active,
        })
        toast.success("Démarche créée avec succès !")
      }
      closeForm()
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Une erreur est survenue.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-3xl font-bold tracking-tight">Gestion des démarches</h2>
          <p className="text-muted-foreground">
            Configurez les démarches administratives proposées sur LegalDoc BJ et leurs formulaires.
          </p>
        </div>
        {!formOpen && (
          <Button onClick={openCreate} className="gap-1.5 h-10">
            <Plus className="h-4 w-4" /> Nouvelle démarche
          </Button>
        )}
      </div>

      {/* Formulaire de création / édition */}
      {formOpen && (
        <Card className="p-6 border-slate-300">
          <div className="flex items-center justify-between mb-4 border-b pb-3">
            <h3 className="font-serif text-xl font-bold text-slate-900">
              {editingId ? "Modifier la démarche" : "Créer une nouvelle démarche"}
            </h3>
            <Button variant="ghost" size="sm" onClick={closeForm}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="demarche-name">Nom de la démarche</Label>
                <Input
                  id="demarche-name"
                  placeholder="Ex: Casier Judiciaire"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="demarche-slug">Slug d&apos;URL (Unique, généré automatiquement)</Label>
                <Input
                  id="demarche-slug"
                  placeholder="Ex: casier-judiciaire"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="demarche-category">Catégorie</Label>
                <Input
                  id="demarche-category"
                  placeholder="Ex: Personnel, Entreprise"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="demarche-price">Tarif public (en €)</Label>
                <Input
                  id="demarche-price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={priceInEuros}
                  onChange={(e) => setPriceInEuros(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="demarche-desc">Description longue</Label>
              <Textarea
                id="demarche-desc"
                placeholder="Décrivez les critères de cette démarche..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3 py-2">
              <Switch
                id="demarche-active"
                checked={active}
                onCheckedChange={setActive}
              />
              <Label htmlFor="demarche-active" className="cursor-pointer font-medium text-sm">
                Démarche visible par le public (Active)
              </Label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading} className="gap-1.5">
                <Save className="h-4 w-4" /> {loading ? "Enregistrement..." : "Sauvegarder"}
              </Button>
              <Button type="button" variant="outline" onClick={closeForm}>
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tableau des démarches */}
      <Card className="overflow-hidden">
        {demarches.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mb-3 text-slate-300" />
            <p className="text-base font-semibold">Aucune démarche enregistrée</p>
            <p className="text-sm mt-1">Créez votre première démarche pour démarrer.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="pl-6 font-semibold text-slate-700">Nom de la démarche</TableHead>
                <TableHead className="font-semibold text-slate-700">Catégorie</TableHead>
                <TableHead className="font-semibold text-slate-700">Tarif</TableHead>
                <TableHead className="font-semibold text-slate-700">Champs requis</TableHead>
                <TableHead className="font-semibold text-slate-700">Statut</TableHead>
                <TableHead className="pr-6 text-right font-semibold text-slate-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demarches.map((item) => (
                <TableRow key={item.id} className="hover:bg-slate-50/50">
                  <TableCell className="pl-6">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-950">{item.name}</span>
                      <span className="text-[10px] font-mono text-muted-foreground mt-0.5">/{item.slug}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded">
                      {item.category ?? "Général"}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">
                    {formatPrice(item.price)}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {item.fieldCount === 0 ? (
                      <span className="text-amber-600 font-medium inline-flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" /> Aucun champ
                      </span>
                    ) : (
                      <span className="text-slate-900 font-medium">
                        {item.fieldCount} {item.fieldCount > 1 ? "champs configurés" : "champ configuré"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.active ? (
                      <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                        Active
                      </span>
                    ) : (
                      <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200">
                        Inactive
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(item)}
                        className="gap-1.5 h-8 text-xs"
                      >
                        <Edit2 className="h-3.5 w-3.5" /> Modifier
                      </Button>
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="gap-1.5 h-8 text-xs"
                      >
                        <Link href={`/admin/demarches/${item.id}/champs`}>
                          <Sliders className="h-3.5 w-3.5" /> Configurer les champs
                        </Link>
                      </Button>
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
