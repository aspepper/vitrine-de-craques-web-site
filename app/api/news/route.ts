import { NextResponse } from "next/server"
import { z } from "zod"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { errorResponse, logApiError } from "@/lib/error"
import { generateUniqueNewsSlug } from "@/lib/news"

const createNewsSchema = z.object({
  title: z.string().min(3, "Título obrigatório").max(160),
  excerpt: z
    .string()
    .max(480, "Resumo deve ter no máximo 480 caracteres")
    .optional(),
  content: z.string().min(20, "Conteúdo deve ter pelo menos 20 caracteres"),
  category: z.string().max(120).optional(),
  coverImage: z.string().url("Informe uma URL válida").optional(),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const json = await req.json()
    const payload = createNewsSchema.parse(json)

    const slug = await generateUniqueNewsSlug(payload.title)

    const news = await prisma.news.create({
      data: {
        title: payload.title,
        slug,
        excerpt: payload.excerpt,
        content: payload.content,
        category: payload.category,
        coverImage: payload.coverImage,
        authorId: session.user.id,
        publishedAt: new Date(),
      },
    })

    return NextResponse.json(news, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const { errorId } = await logApiError(req, error, "AO CRIAR ARTIGO")
      return NextResponse.json({ error: error.flatten(), errorId }, { status: 400 })
    }

    return errorResponse(req, error, "AO CRIAR ARTIGO")
  }
}
