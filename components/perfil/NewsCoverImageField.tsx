"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { ImageIcon, Loader2, Trash2, UploadCloud } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface NewsCoverImageFieldProps {
  id: string
  name: string
  defaultValue?: string | null
}

export function NewsCoverImageField({ id, name, defaultValue }: NewsCoverImageFieldProps) {
  const [value, setValue] = useState(defaultValue ?? "")
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultValue ?? null)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const objectUrlRef = useRef<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const hasValue = value.trim().length > 0

  const helperText = useMemo(
    () =>
      "Envie uma imagem com no mínimo 1600x895 pixels. Imagens maiores serão automaticamente redimensionadas.",
    [],
  )

  const resetObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
  }, [])

  const handleUpload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("Envie um arquivo de imagem válido.")
        return
      }

      setError(null)
      setIsUploading(true)

      const formData = new FormData()
      formData.append("cover", file)
      if (hasValue) {
        formData.append("previousUrl", value)
      }

      try {
        const response = await fetch("/api/news/cover", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const result = await response.json().catch(() => null)
          const message =
            typeof result?.error === "string"
              ? result.error
              : "Não foi possível enviar a imagem."
          throw new Error(message)
        }

        const data = (await response.json()) as { url: string }
        resetObjectUrl()
        setPreviewUrl(data.url)
        setValue(data.url)
        setError(null)
      } catch (uploadError) {
        console.error("Erro ao enviar imagem de capa", uploadError)
        setError(uploadError instanceof Error ? uploadError.message : "Falha ao processar a imagem.")
        resetObjectUrl()
        if (!hasValue) {
          setPreviewUrl(null)
          setValue("")
        } else {
          setPreviewUrl(value || null)
        }
      } finally {
        setIsUploading(false)
      }
    },
    [hasValue, resetObjectUrl, value],
  )

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) {
        return
      }

      resetObjectUrl()
      const objectUrl = URL.createObjectURL(file)
      objectUrlRef.current = objectUrl
      setPreviewUrl(objectUrl)

      await handleUpload(file)
    },
    [handleUpload, resetObjectUrl],
  )

  const handleRemove = useCallback(() => {
    resetObjectUrl()
    setPreviewUrl(null)
    setValue("")
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [resetObjectUrl])

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>Imagem de capa</Label>
      <input type="hidden" name={name} value={value} />
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-700/60 dark:bg-slate-900/60">
        <div className="relative overflow-hidden rounded-xl border border-dashed border-slate-300 bg-white/60 dark:border-slate-600 dark:bg-slate-950/60">
          <div className="relative aspect-[16/9] w-full">
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Pré-visualização da imagem de capa"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority={false}
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-slate-400">
                <ImageIcon className="h-8 w-8" aria-hidden />
                <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma imagem selecionada</p>
              </div>
            )}
            {isUploading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm dark:bg-slate-900/70">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-500" aria-hidden />
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Input
            ref={fileInputRef}
            id={id}
            type="file"
            accept="image/*"
            disabled={isUploading}
            onChange={handleFileChange}
            className="max-w-full cursor-pointer"
          />
          {hasValue ? (
            <Button type="button" variant="outline" onClick={handleRemove} disabled={isUploading} className="inline-flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Remover
            </Button>
          ) : null}
          <div className="flex-1" />
          <Button
            type="button"
            variant="default"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="ml-auto inline-flex items-center gap-2"
          >
            <UploadCloud className="h-4 w-4" />
            Selecionar imagem
          </Button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </div>
  )
}
