"use client"

import { SafeImage } from "@/components/media/SafeMedia"
import Link from "next/link"
import { useMemo, useState } from "react"
import { Film, Heart, PenSquare, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export type VideoManagerItem = {
  id: string
  title: string
  description: string | null
  videoUrl: string
  thumbnailUrl: string | null
  likesCount: number
  createdAt: string
}

interface VideoManagerProps {
  initialVideos: VideoManagerItem[]
}

function normalizeVideo(payload: any): VideoManagerItem {
  return {
    id: String(payload.id),
    title: String(payload.title ?? ""),
    description: payload.description ?? null,
    videoUrl: String(payload.videoUrl ?? ""),
    thumbnailUrl: payload.thumbnailUrl ?? null,
    likesCount: Number(payload.likesCount ?? 0),
    createdAt: new Date(payload.createdAt ?? Date.now()).toISOString(),
  }
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function VideoManager({ initialVideos }: VideoManagerProps) {
  const [videos, setVideos] = useState(() => initialVideos.map(normalizeVideo))

  const ordered = useMemo(
    () =>
      [...videos].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [videos],
  )

  function handleUpdate(updated: VideoManagerItem) {
    setVideos((prev) => prev.map((video) => (video.id === updated.id ? updated : video)))
  }

  function handleRemove(id: string) {
    setVideos((prev) => prev.filter((video) => video.id !== id))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
        <Film className="h-6 w-6 text-sky-500" aria-hidden />
        <p className="text-sm">Edite os títulos dos vídeos e acompanhe o engajamento</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {ordered.map((video) => (
          <VideoManagerCard
            key={video.id}
            item={video}
            onUpdate={handleUpdate}
            onDelete={handleRemove}
          />
        ))}
        {ordered.length === 0 ? (
          <div className="col-span-full flex flex-col items-center gap-3 rounded-3xl border border-dashed border-sky-200 bg-slate-50/90 p-10 text-center text-slate-500 shadow-[0_18px_60px_-40px_rgba(14,165,233,0.55)] dark:border-sky-500/20 dark:bg-gradient-to-br dark:from-slate-900/90 dark:via-slate-900/80 dark:to-slate-900/70 dark:text-slate-200 dark:shadow-[0_28px_88px_-48px_rgba(8,47,73,0.85)]">
            <Film className="h-8 w-8 text-sky-400" aria-hidden />
            <p className="text-sm">Nenhum vídeo cadastrado ainda.</p>
            <p className="text-xs text-slate-400 dark:text-slate-400">
              Publique vídeos na área de upload para vê-los aqui.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

interface VideoManagerCardProps {
  item: VideoManagerItem
  onUpdate: (item: VideoManagerItem) => void
  onDelete: (id: string) => void
}

function VideoManagerCard({ item, onUpdate, onDelete }: VideoManagerCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)

    const form = event.currentTarget
    const data = new FormData(form)
    const title = data.get("title")?.toString().trim()

    if (!title) {
      setErrorMessage("Informe um título válido.")
      return
    }

    const payload = {
      title,
      description: data.get("description")?.toString().trim() || null,
    }

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/videos/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => null)
        const message =
          typeof result?.error === "string"
            ? result.error
            : "Não foi possível atualizar o vídeo."
        setErrorMessage(message)
        return
      }

      const updated = normalizeVideo(await response.json())
      onUpdate(updated)
      setIsEditing(false)
    } catch (error) {
      console.error(error)
      setErrorMessage("Erro ao atualizar o vídeo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm("Deseja realmente excluir este vídeo?")) {
      return
    }

    try {
      const response = await fetch(`/api/videos/${item.id}`, { method: "DELETE" })
      if (!response.ok) {
        const result = await response.json().catch(() => null)
        const message =
          typeof result?.error === "string"
            ? result.error
            : "Não foi possível excluir o vídeo."
        setErrorMessage(message)
        return
      }

      onDelete(item.id)
    } catch (error) {
      console.error(error)
      setErrorMessage("Erro ao excluir o vídeo.")
    }
  }

  if (isEditing) {
    return (
      <form
        onSubmit={handleSubmit}
        className="flex h-full flex-col gap-4 rounded-3xl border border-sky-100 bg-white/95 p-6 shadow-[0_28px_80px_-48px_rgba(14,165,233,0.5)] dark:border-sky-500/20 dark:bg-slate-900/80 dark:shadow-[0_36px_90px_-48px_rgba(12,74,110,0.75)]"
      >
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor={`title-${item.id}`}>Título</Label>
            <Input id={`title-${item.id}`} name="title" defaultValue={item.title} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`description-${item.id}`}>Descrição</Label>
            <Textarea
              id={`description-${item.id}`}
              name="description"
              defaultValue={item.description ?? ""}
              className="min-h-[120px]"
            />
          </div>
        </div>
        {errorMessage ? (
          <p className="text-sm text-destructive">{errorMessage}</p>
        ) : null}
        <div className="mt-auto flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setIsEditing(false)
              setErrorMessage(null)
            }}
            className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    )
  }

  return (
    <article className="flex h-full flex-col gap-4 overflow-hidden rounded-3xl border border-white/70 bg-white/95 shadow-[0_28px_80px_-48px_rgba(15,23,42,0.5)] dark:border-white/10 dark:bg-slate-900/80 dark:shadow-[0_36px_90px_-48px_rgba(2,6,23,0.85)]">
      <div className="relative aspect-video w-full overflow-hidden bg-slate-900/60">
        {item.thumbnailUrl ? (
          <SafeImage
            src={item.thumbnailUrl}
            alt={item.title}
            fill
            className="object-cover"
            sizes="(min-width: 1280px) 320px, (min-width: 768px) 45vw, 90vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-white/80">
            <Film className="h-10 w-10" aria-hidden />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 py-3 text-sm text-white">
          <span>{formatDate(item.createdAt)}</span>
          <span className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.18em] text-rose-200">
            <Heart className="h-3.5 w-3.5" aria-hidden />
            {new Intl.NumberFormat("pt-BR").format(item.likesCount)}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 px-6 pb-6">
        <h3 className="font-heading text-lg font-semibold text-slate-900 dark:text-slate-100">{item.title}</h3>
        {item.description ? (
          <p className="text-sm text-slate-600 line-clamp-3 dark:text-slate-300">{item.description}</p>
        ) : null}
        <div className="mt-auto flex items-center justify-between pt-2">
          <Button
            asChild
            variant="ghost"
            className="rounded-full bg-slate-100/60 px-4 py-1 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-700/60"
          >
            <Link href={`/player/${item.id}`}>Assistir</Link>
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-sky-600 hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-500/10"
              onClick={() => setIsEditing(true)}
            >
              <PenSquare className="h-4 w-4" />
              <span className="sr-only">Editar vídeo</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-rose-500 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Excluir vídeo</span>
            </Button>
          </div>
        </div>
        {errorMessage ? (
          <p className="text-sm text-destructive">{errorMessage}</p>
        ) : null}
      </div>
    </article>
  )
}
