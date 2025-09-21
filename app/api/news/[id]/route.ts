import { NextResponse } from "next/server"
import { z } from "zod"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { errorResponse, logApiError } from "@/lib/error"
import { generateUniqueNewsSlug } from "@/lib/news"

const updateNewsSchema = z
  .object({
    title: z.string().min(3).max(160).optional(),
    excerpt: z.string().max(480).optional(),
    content: z.string().min(20).optional(),
    category: z.string().max(120).optional(),
    coverImage: z.string().url().optional(),
  })
  .refine((value) => Object.values(value).some((field) => field !== undefined), {
    message: "Informe ao menos um campo para atualizar",
  })

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const news = await prisma.news.findUnique({ where: { id: params.id } })
    if (!news) {
      return NextResponse.json({ error: "Artigo não encontrado" }, { status: 404 })
    }

    if (news.authorId !== session.user.id) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const body = await req.json()
    const payload = updateNewsSchema.parse(body)

    const data: {
      title?: string
      slug?: string
      excerpt?: string | null
      content?: string | null
      category?: string | null
      coverImage?: string | null
    } = {}

    if (payload.title && payload.title !== news.title) {
      data.title = payload.title
      data.slug = await generateUniqueNewsSlug(payload.title, news.id)
    } else if (payload.title) {
      data.title = payload.title
    }

    if (payload.excerpt !== undefined) data.excerpt = payload.excerpt ?? null
    if (payload.content !== undefined) data.content = payload.content ?? null
    if (payload.category !== undefined) data.category = payload.category ?? null
    if (payload.coverImage !== undefined) data.coverImage = payload.coverImage ?? null

    const updated = await prisma.news.update({
      where: { id: params.id },
      data,
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const { errorId } = await logApiError(req, error, "AO ATUALIZAR ARTIGO")
      return NextResponse.json({ error: error.flatten(), errorId }, { status: 400 })
    }

    return errorResponse(req, error, "AO ATUALIZAR ARTIGO")
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const news = await prisma.news.findUnique({ where: { id: params.id } })
    if (!news) {
      return NextResponse.json({ error: "Artigo não encontrado" }, { status: 404 })
    }

    if (news.authorId !== session.user.id) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    await prisma.news.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    return errorResponse(req, error, "AO REMOVER ARTIGO")
  }
}
