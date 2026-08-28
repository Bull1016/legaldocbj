"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Paperclip, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { uploadFile } from "@/app/actions/upload"
import { createRequest } from "@/app/actions/requests"

export type FormField = {
  id: number
  label: string
  fieldKey: string
  fieldType: string
  required: boolean
  options: string | null
  helpText: string | null
}

type FieldState = {
  value: string
  fileUrl: string | null
  fileName: string | null
  uploading: boolean
}

export function RequestForm({
  documentTypeId,
  fields,
}: {
  documentTypeId: number
  fields: FormField[]
}) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [state, setState] = useState<Record<number, FieldState>>(() =>
    Object.fromEntries(fields.map((f) => [f.id, { value: "", fileUrl: null, fileName: null, uploading: false }])),
  )

  function update(id: number, patch: Partial<FieldState>) {
    setState((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }))
  }

  async function handleFile(field: FormField, file: File | undefined) {
    if (!file) return
    update(field.id, { uploading: true })
    try {
      const fd = new FormData()
      fd.set("file", file)
      const { url, name } = await uploadFile(fd)
      update(field.id, { fileUrl: url, fileName: name, uploading: false })
      toast.success(`"${name}" ajouté`)
    } catch (err) {
      update(field.id, { uploading: false })
      toast.error(err instanceof Error ? err.message : "Échec du téléversement")
    }
  }

  async function handleSubmit(submit: boolean) {
    setSubmitting(true)
    try {
      const values = fields.map((f) => ({
        fieldId: f.id,
        fieldKey: f.fieldKey,
        value: state[f.id]?.value || null,
        fileUrl: state[f.id]?.fileUrl || null,
        fileName: state[f.id]?.fileName || null,
      }))
      const { id } = await createRequest({ documentTypeId, values, submit })
      toast.success(submit ? "Demande soumise" : "Brouillon enregistré")
      router.push(`/dashboard/demandes/${id}`)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Une erreur est survenue")
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleSubmit(true)
      }}
      className="flex flex-col gap-5"
    >
      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Aucun champ à remplir pour cette démarche. Vous pouvez soumettre directement.
        </p>
      )}

      {fields.map((field) => {
        const fs = state[field.id]
        return (
          <div key={field.id} className="flex flex-col gap-2">
            <Label htmlFor={`field-${field.id}`}>
              {field.label}
              {field.required && <span className="ml-1 text-destructive">*</span>}
            </Label>

            {field.fieldType === "textarea" ? (
              <Textarea
                id={`field-${field.id}`}
                value={fs.value}
                onChange={(e) => update(field.id, { value: e.target.value })}
                required={field.required}
                rows={4}
              />
            ) : field.fieldType === "select" ? (
              <Select value={fs.value} onValueChange={(v) => v && update(field.id, { value: v })}>
                <SelectTrigger id={`field-${field.id}`}>
                  <SelectValue placeholder="Sélectionnez…" />
                </SelectTrigger>
                <SelectContent>
                  {(field.options ? field.options.split(",") : []).map((opt) => {
                    const val = opt.trim()
                    return (
                      <SelectItem key={val} value={val}>
                        {val}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            ) : field.fieldType === "file" ? (
              <div className="flex items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent">
                  {fs.uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : fs.fileUrl ? (
                    <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                  ) : (
                    <Paperclip className="h-4 w-4" aria-hidden="true" />
                  )}
                  {fs.fileName ?? "Choisir un fichier"}
                  <input
                    type="file"
                    className="sr-only"
                    onChange={(e) => handleFile(field, e.target.files?.[0])}
                  />
                </label>
              </div>
            ) : (
              <Input
                id={`field-${field.id}`}
                type={field.fieldType === "date" ? "date" : field.fieldType === "number" ? "number" : "text"}
                value={fs.value}
                onChange={(e) => update(field.id, { value: e.target.value })}
                required={field.required}
              />
            )}

            {field.helpText && <p className="text-xs text-muted-foreground">{field.helpText}</p>}
          </div>
        )
      })}

      <div className="mt-2 flex flex-wrap gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Envoi…" : "Soumettre ma demande"}
        </Button>
        <Button type="button" variant="outline" disabled={submitting} onClick={() => handleSubmit(false)}>
          Enregistrer le brouillon
        </Button>
      </div>
    </form>
  )
}
