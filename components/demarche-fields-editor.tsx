"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Trash, ArrowLeft, Save, Sliders, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

/** Parse the comma-separated options string into an array of trimmed non-empty strings */
function parseOptions(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}

/** Join an array of option strings back into the stored comma-separated format */
function joinOptions(opts: string[]): string {
  return opts.join(", ")
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

  /** Add a new chip option to a select field */
  function addOption(index: number, newOpt: string) {
    const trimmed = newOpt.trim()
    if (!trimmed) return
    const existing = parseOptions(fields[index].options)
    if (existing.includes(trimmed)) return
    updateField(index, { options: joinOptions([...existing, trimmed]) })
  }

  /** Remove a chip option from a select field */
  function removeOption(index: number, optToRemove: string) {
    const existing = parseOptions(fields[index].options)
    updateField(index, { options: joinOptions(existing.filter((o) => o !== optToRemove)) })
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
            <Sliders className="h-12 w-12 text-muted-foreground/30 mb-3" />
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
              <Card key={idx} className="p-5 relative">
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

                {/* Responsive grid: 1 col → 2 col at md → 4 col at xl */}
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 pr-10">
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

                  {/* Shadcn Select instead of native <select> */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`type-${idx}`}>Type de saisie</Label>
                    <Select
                      value={field.fieldType}
                      onValueChange={(val) => val && updateField(idx, { fieldType: val })}
                    >
                      <SelectTrigger id={`type-${idx}`}>
                        <SelectValue placeholder="Type de saisie" />
                      </SelectTrigger>
                      <SelectContent>
                        {FIELD_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <OptionsEditor
                      fieldIndex={idx}
                      options={parseOptions(field.options)}
                      onAdd={(opt) => addOption(idx, opt)}
                      onRemove={(opt) => removeOption(idx, opt)}
                    />
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
          <Button
            render={<Link href="/admin/demarches">Annuler</Link>}
            variant="outline"
            type="button"
          />
        </div>
      </form>
    </div>
  )
}

/** Tags/chips UI for select options — easier to use than comma-separated text input */
function OptionsEditor({
  fieldIndex,
  options,
  onAdd,
  onRemove,
}: {
  fieldIndex: number
  options: string[]
  onAdd: (opt: string) => void
  onRemove: (opt: string) => void
}) {
  const [draft, setDraft] = useState("")

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      onAdd(draft)
      setDraft("")
    }
  }

  function handleBlur() {
    if (draft.trim()) {
      onAdd(draft)
      setDraft("")
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`options-input-${fieldIndex}`}>Options de la liste déroulante</Label>
      <div className="flex flex-wrap gap-1.5 p-2 rounded-md border border-input bg-background min-h-[2.5rem]">
        {options.map((opt) => (
          <span
            key={opt}
            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary border border-primary/20"
          >
            {opt}
            <button
              type="button"
              onClick={() => onRemove(opt)}
              className="text-primary/60 hover:text-primary transition-colors"
              aria-label={`Supprimer l'option ${opt}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          id={`options-input-${fieldIndex}`}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={options.length === 0 ? "Tapez une option puis Entrée…" : "Ajouter…"}
          className="flex-1 min-w-[8rem] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      <span className="text-[10px] text-muted-foreground">
        Appuyez sur Entrée ou virgule pour ajouter chaque option.
      </span>
    </div>
  )
}
