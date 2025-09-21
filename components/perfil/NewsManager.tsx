"use client"

import { useMemo, useState } from "react"
import { FileText, Heart, PenSquare, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export type NewsManagerItem = {
  id: string
  title: string
  excerpt: string | null
  content: string | null
  category: string | null
  coverImage: string | null
  likesCount: number
  publishedAt: string
  updatedAt: string
  slug: string
}

interface NewsManagerProps {
  initialNews: NewsManagerItem[]
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

function normalizeNews(payload: any): NewsManagerItem {
  return {
    id: String(payload.id),
    title: String(payload.title ?? ""),
    excerpt: payload.excerpt ?? null,
    content: payload.content ?? null,
    category: payload.category ?? null,
    coverImage: payload.coverImage ?? null,
    likesCount: Number(payload.likesCount ?? 0),
    publishedAt: new Date(payload.publishedAt ?? Date.now()).toISOString(),
    updatedAt: new Date(payload.updatedAt ?? Date.now()).toISOString(),
    slug: String(payload.slug ?? payload.id ?? ""),
  }
}

export function NewsManager({ initialNews }: NewsManagerProps) {
  const [items, setItems] = useState(() => initialNews.map(normalizeNews))
  const [createError, setCreateError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const orderedItems = useMemo(
    () =>
      [...items].sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    [items],
  )

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCreateError(null)

    const form = event.currentTarget
    const data = new FormData(form)
    const title = data.get("title")?.toString().trim()
    const content = data.get("content")?.toString().trim()

    if (!title || !content) {
      setCreateError("Título e conteúdo são obrigatórios.")
      return
    }

    const payload = {
      title,
      excerpt: data.get("excerpt")?.toString().trim() || undefined,
      category: data.get("category")?.toString().trim() || undefined,
      coverImage: data.get("coverImage")?.toString().trim() || undefined,
      content,
    }

    try {
      setIsCreating(true)
      const response = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => null)
        const message =
          typeof result?.error === "string"
            ? result.error
            : "Não foi possível criar o artigo."
        setCreateError(message)
        return
      }

      const created = normalizeNews(await response.json())
      setItems((prev) => [created, ...prev])
      form.reset()
      setShowCreateForm(false)
    } catch (error) {
      console.error(error)
      setCreateError("Ocorreu um erro ao criar o artigo.")
    } finally {
      setIsCreating(false)
    }
  }

  function handleRemove(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  function handleUpdate(updated: NewsManagerItem) {
    setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-slate-600">
          <FileText className="h-6 w-6 text-emerald-500" aria-hidden />
          <p className="text-sm">Gerencie seus artigos publicados</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowCreateForm((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-full border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-600 shadow-[0_16px_40px_-24px_rgba(16,185,129,0.65)] transition hover:border-emerald-300 hover:bg-emerald-50/60"
        >
          <Plus className="h-4 w-4" />
          Novo artigo
        </Button>
      </div>

      {showCreateForm ? (
        <form
          onSubmit={handleCreate}
          className="space-y-4 rounded-3xl border border-emerald-100 bg-white/90 p-6 shadow-[0_32px_90px_-48px_rgba(16,185,129,0.55)]"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" name="title" placeholder="Digite o título do artigo" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Categoria</Label>
              <Input id="category" name="category" placeholder="Categoria (opcional)" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="excerpt">Resumo</Label>
            <Textarea
              id="excerpt"
              name="excerpt"
              placeholder="Descrição breve do artigo"
              className="min-h-[80px]"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="coverImage">Imagem de capa</Label>
            <Input
              id="coverImage"
              name="coverImage"
              placeholder="URL da imagem (opcional)"
              type="url"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="content">Conteúdo</Label>
            <Textarea
              id="content"
              name="content"
              placeholder="Escreva o conteúdo principal do artigo"
              className="min-h-[160px]"
            />
          </div>
          {createError ? (
            <p className="text-sm text-destructive">{createError}</p>
          ) : null}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowCreateForm(false)
                setCreateError(null)
              }}
              className="text-slate-600 hover:text-slate-900"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Salvando..." : "Publicar"}
            </Button>
          </div>
        </form>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {orderedItems.map((item) => (
          <NewsManagerCard
            key={item.id}
            item={item}
            onDelete={handleRemove}
            onUpdate={handleUpdate}
          />
        ))}
        {orderedItems.length === 0 && !showCreateForm ? (
          <div className="col-span-full flex flex-col items-center gap-3 rounded-3xl border border-dashed border-emerald-200 bg-white/80 p-10 text-center text-slate-500 shadow-[0_16px_60px_-40px_rgba(16,185,129,0.65)]">
            <FileText className="h-8 w-8 text-emerald-400" aria-hidden />
            <p className="text-sm">Nenhum artigo publicado ainda.</p>
            <p className="text-xs text-slate-400">
              Utilize o botão “Novo artigo” para criar sua primeira publicação.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

interface NewsManagerCardProps {
  item: NewsManagerItem
  onUpdate: (item: NewsManagerItem) => void
  onDelete: (id: string) => void
}

function NewsManagerCard({ item, onUpdate, onDelete }: NewsManagerCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)

    const form = event.currentTarget
    const data = new FormData(form)
    const title = data.get("title")?.toString().trim()
    const content = data.get("content")?.toString().trim()

    if (!title || !content) {
      setErrorMessage("Título e conteúdo são obrigatórios.")
      return
    }

    const payload = {
      title,
      excerpt: data.get("excerpt")?.toString().trim() || null,
      category: data.get("category")?.toString().trim() || null,
      coverImage: data.get("coverImage")?.toString().trim() || null,
      content,
    }

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/news/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => null)
        const message =
          typeof result?.error === "string"
            ? result.error
            : "Não foi possível atualizar o artigo."
        setErrorMessage(message)
        return
      }

      const updated = normalizeNews(await response.json())
      onUpdate(updated)
      setIsEditing(false)
    } catch (error) {
      console.error(error)
      setErrorMessage("Erro ao atualizar o artigo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm("Deseja realmente excluir este artigo?")) {
      return
    }

    try {
      const response = await fetch(`/api/news/${item.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const result = await response.json().catch(() => null)
        const message =
          typeof result?.error === "string"
            ? result.error
            : "Não foi possível excluir o artigo."
        setErrorMessage(message)
        return
      }

      onDelete(item.id)
    } catch (error) {
      console.error(error)
      setErrorMessage("Erro ao excluir o artigo.")
    }
  }

  if (isEditing) {
    return (
      <form
        onSubmit={handleSubmit}
        className="flex h-full flex-col gap-4 rounded-3xl border border-emerald-100 bg-white/95 p-6 shadow-[0_28px_80px_-48px_rgba(16,185,129,0.55)]"
      >
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor={`title-${item.id}`}>Título</Label>
            <Input
              id={`title-${item.id}`}
              name="title"
              defaultValue={item.title}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`category-${item.id}`}>Categoria</Label>
            <Input
              id={`category-${item.id}`}
              name="category"
              defaultValue={item.category ?? ""}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`excerpt-${item.id}`}>Resumo</Label>
            <Textarea
              id={`excerpt-${item.id}`}
              name="excerpt"
              defaultValue={item.excerpt ?? ""}
              className="min-h-[70px]"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`coverImage-${item.id}`}>Imagem de capa</Label>
            <Input
              id={`coverImage-${item.id}`}
              name="coverImage"
              defaultValue={item.coverImage ?? ""}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`content-${item.id}`}>Conteúdo</Label>
            <Textarea
              id={`content-${item.id}`}
              name="content"
              defaultValue={item.content ?? ""}
              className="min-h-[140px]"
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
            className="text-slate-600 hover:text-slate-900"
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </form>
    )
  }

  return (
    <article className="flex h-full flex-col gap-4 rounded-3xl border border-white/70 bg-white/95 p-6 shadow-[0_28px_80px_-48px_rgba(15,23,42,0.55)]">
      <header className="space-y-2">
        <h3 className="font-heading text-xl font-semibold text-slate-900">
          {item.title}
        </h3>
        <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-emerald-500">
          {item.category ? <span>{item.category}</span> : null}
          <span>{`Atualizado em ${formatDate(item.updatedAt)}`}</span>
        </div>
      </header>
      {item.excerpt ? (
        <p className="text-sm text-slate-600">{item.excerpt}</p>
      ) : null}
      <div className="mt-auto flex items-center justify-between pt-2 text-sm text-slate-500">
        <span className="inline-flex items-center gap-2">
          <Heart className="h-4 w-4 text-rose-500" aria-hidden />
          {new Intl.NumberFormat("pt-BR").format(item.likesCount)} curtidas
        </span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-emerald-600 hover:bg-emerald-50"
            onClick={() => setIsEditing(true)}
          >
            <PenSquare className="h-4 w-4" />
            <span className="sr-only">Editar artigo</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-rose-500 hover:bg-rose-50"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Excluir artigo</span>
          </Button>
        </div>
      </div>
      {errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}
    </article>
  )
}
