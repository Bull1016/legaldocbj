"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Trash, ArrowLeft, Save, Sliders } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { adminSaveDocumentFields } from "@/app/actions/admin"
import { FIELD_TYPES } from "@/lib/status"
import Link from "next/link"

type FieldItem = {
  id?: number
  label: string
  fieldKey: string
  fieldType: string
  required: boolean
  options: string
  helpText: string
  sortOrder: number
}

export function DemarcheFieldsEditor({
  documentTypeId,
  documentTypeName,
  initialFields,
}: {
  documentTypeId: number
  documentTypeName: string
  initialFields: any[]
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fields, setFields] = useState<FieldItem[]>(() =>
    initialFields.map((f) => ({
      id: f.id,
      label: f.label,
      fieldKey: f.fieldKey,
      fieldType: f.fieldType,
      required: f.required,
      options: f.options ?? "",
      helpText: f.helpText ?? "",
      sortOrder: f.sortOrder ?? 0,
    }))
  )

  function addField() {
    const nextOrder = fields.length > 0 ? Math.max(...fields.map((f) => f.sortOrder)) + 10 : 10
    setFields((prev) => [
      ...prev,
      {
        label: "",
        fieldKey: "",
        fieldType: "text",
        required: true,
        options: "",
        helpText: "",
        sortOrder: nextOrder,
      },
    ])
  }

  function updateField(index: number, patch: Partial<FieldItem>) {
    setFields((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], ...patch }
      return copy
    })
  }

  function removeField(index: number) {
    setFields((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()

    // Basic validation
    for (const f of fields) {
      if (!f.label.trim()) {
        toast.error("Chaque champ doit avoir un libellé.")
        return
      }
      if (!f.fieldKey.trim()) {
        toast.error("Chaque champ doit avoir une clé technique (ex: nom_complet).")
        return
      }
      // Check alphanumeric and underscores only for key
      if (!/^[a-zA-Z0-9_-]+$/.test(f.fieldKey)) {
        toast.error(`La clé "${f.fieldKey}" doit contenir uniquement des lettres, chiffres, tirets ou underscores.`)
        return
      }
    }

    setLoading(true)
    try {
      await adminSaveDocumentFields(documentTypeId, fields)
      toast.success("Champs de la démarche enregistrés avec succès !")
      router.push("/admin/demarches")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur d'enregistrement")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Link
          href="/admin/demarches"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground w-fit"
        >
          <ArrowLeft className="h-4 w-4" /> Retour aux démarches
        </Link>
        <div className="flex items-center justify-between mt-2">
          <div>
            <h2 className="font-serif text-3xl font-bold tracking-tight">Configuration des champs</h2>
            <p className="text-muted-foreground">
              Démarche : <span className="font-semibold text-foreground">{documentTypeName}</span>
            </p>
          </div>
          <Button onClick={addField} type="button" size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> Ajouter un champ
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {fields.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center border-dashed">
            <Sliders className="h-12 w-12 text-slate-300 mb-3" />
            <p className="text-base font-semibold">Aucun champ configuré</p>
            <p className="text-sm mt-1 max-w-sm">
              Cette démarche ne demande actuellement aucune saisie spécifique. Ajoutez des champs pour créer un formulaire personnalisé.
            </p>
            <Button onClick={addField} type="button" variant="outline" className="mt-4 gap-1.5">
              <Plus className="h-4 w-4" /> Créer mon premier champ
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {fields.map((field, idx) => (
              <Card key={idx} className="p-5 relative border-slate-200">
                <div className="absolute top-4 right-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeField(idx)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 pr-10">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`label-${idx}`}>Libellé (Affiché au client)</Label>
                    <Input
                      id={`label-${idx}`}
                      placeholder="Ex: Numéro de téléphone"
                      value={field.label}
                      onChange={(e) => updateField(idx, { label: e.target.value })}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`key-${idx}`}>Clé technique (Unique, sans espace)</Label>
                    <Input
                      id={`key-${idx}`}
                      placeholder="Ex: telephone_client"
                      value={field.fieldKey}
                      onChange={(e) => updateField(idx, { fieldKey: e.target.value })}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`type-${idx}`}>Type de saisie</Label>
                    <select
                      id={`type-${idx}`}
                      value={field.fieldType}
                      onChange={(e) => updateField(idx, { fieldType: e.target.value })}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {FIELD_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`order-${idx}`}>Ordre de tri</Label>
                    <Input
                      id={`order-${idx}`}
                      type="number"
                      value={field.sortOrder}
                      onChange={(e) => updateField(idx, { sortOrder: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 mt-4 pr-10">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`help-${idx}`}>Texte d&apos;aide / Consignes</Label>
                    <Input
                      id={`help-${idx}`}
                      placeholder="Ex: Fournissez un numéro au format international."
                      value={field.helpText}
                      onChange={(e) => updateField(idx, { helpText: e.target.value })}
                    />
                  </div>

                  {field.fieldType === "select" && (
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`options-${idx}`}>Options de la liste déroulante</Label>
                      <Input
                        id={`options-${idx}`}
                        placeholder="Option A, Option B, Option C"
                        value={field.options}
                        onChange={(e) => updateField(idx, { options: e.target.value })}
                        required
                      />
                      <span className="text-[10px] text-muted-foreground">Séparer les choix par une virgule.</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <Switch
                    id={`req-${idx}`}
                    checked={field.required}
                    onCheckedChange={(checked) => updateField(idx, { required: checked })}
                  />
                  <Label htmlFor={`req-${idx}`} className="cursor-pointer text-sm font-medium">
                    Ce champ est obligatoire pour valider la démarche
                  </Label>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={loading} className="gap-1.5">
            <Save className="h-4 w-4" /> {loading ? "Enregistrement..." : "Enregistrer la configuration"}
          </Button>
          <Button asChild variant="outline" type="button">
            <Link href="/admin/demarches">Annuler</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
