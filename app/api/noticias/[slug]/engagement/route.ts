import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { errorResponse } from "@/lib/error"

interface Params {
  params: { slug: string }
}

const actionSchema = z.object({
  action: z.enum(["like", "save"]),
  enabled: z.boolean().optional(),
})

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    const news = await prisma.news.findUnique({
      where: { slug: params.slug },
      select: {
        id: true,
        likesCount: true,
        savesCount: true,
        commentsCount: true,
      },
    })

    if (!news) {
      return NextResponse.json({ error: "Notícia não encontrada" }, { status: 404 })
    }

    const userId = session?.user?.id
    let userState: { liked: boolean; saved: boolean } | null = null

    if (userId) {
      const [like, save] = await Promise.all([
        prisma.newsLike.findUnique({
          where: {
            newsId_userId: {
              newsId: news.id,
              userId,
            },
          },
        }),
        prisma.newsSave.findUnique({
          where: {
            newsId_userId: {
              newsId: news.id,
              userId,
            },
          },
        }),
      ])

      userState = {
        liked: Boolean(like),
        saved: Boolean(save),
      }
    }

    return NextResponse.json({
      metrics: {
        likes: news.likesCount,
        saves: news.savesCount,
        comments: news.commentsCount,
        shares: 0,
      },
      user: userState,
    })
  } catch (error) {
    return errorResponse(req, error, "AO BUSCAR INTERAÇÕES DA NOTÍCIA")
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    const payload = actionSchema.parse(await req.json())

    const news = await prisma.news.findUnique({
      where: { slug: params.slug },
      select: {
        id: true,
        likesCount: true,
        savesCount: true,
        commentsCount: true,
      },
    })

    if (!news) {
      return NextResponse.json({ error: "Notícia não encontrada" }, { status: 404 })
    }

    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const [existingLike, existingSave] = await Promise.all([
      prisma.newsLike.findUnique({
        where: {
          newsId_userId: {
            newsId: news.id,
            userId,
          },
        },
      }),
      prisma.newsSave.findUnique({
        where: {
          newsId_userId: {
            newsId: news.id,
            userId,
          },
        },
      }),
    ])

    let likesCount = news.likesCount
    let savesCount = news.savesCount
    const commentsCount = news.commentsCount
    let liked = Boolean(existingLike)
    let saved = Boolean(existingSave)

    if (payload.action === "like") {
      const enable = payload.enabled ?? !existingLike

      if (enable && !existingLike) {
        const [, updated] = await prisma.$transaction([
          prisma.newsLike.create({
            data: {
              newsId: news.id,
              userId,
            },
          }),
          prisma.news.update({
            where: { id: news.id },
            data: {
              likesCount: { increment: 1 },
            },
            select: { likesCount: true, savesCount: true, commentsCount: true },
          }),
        ])

        likesCount = updated.likesCount
        savesCount = updated.savesCount
        liked = true
      } else if (!enable && existingLike) {
        const [, updated] = await prisma.$transaction([
          prisma.newsLike.delete({ where: { id: existingLike.id } }),
          prisma.news.update({
            where: { id: news.id },
            data: {
              likesCount: { decrement: 1 },
            },
            select: { likesCount: true, savesCount: true, commentsCount: true },
          }),
        ])

        likesCount = updated.likesCount
        savesCount = updated.savesCount
        liked = false
      }
    } else {
      const enable = payload.enabled ?? !existingSave

      if (enable && !existingSave) {
        const [, updated] = await prisma.$transaction([
          prisma.newsSave.create({
            data: {
              newsId: news.id,
              userId,
            },
          }),
          prisma.news.update({
            where: { id: news.id },
            data: {
              savesCount: { increment: 1 },
            },
            select: { likesCount: true, savesCount: true, commentsCount: true },
          }),
        ])

        likesCount = updated.likesCount
        savesCount = updated.savesCount
        saved = true
      } else if (!enable && existingSave) {
        const [, updated] = await prisma.$transaction([
          prisma.newsSave.delete({ where: { id: existingSave.id } }),
          prisma.news.update({
            where: { id: news.id },
            data: {
              savesCount: { decrement: 1 },
            },
            select: { likesCount: true, savesCount: true, commentsCount: true },
          }),
        ])

        likesCount = updated.likesCount
        savesCount = updated.savesCount
        saved = false
      }
    }

    return NextResponse.json({
      metrics: {
        likes: likesCount,
        saves: savesCount,
        comments: commentsCount,
        shares: 0,
      },
      user: {
        liked,
        saved,
      },
    })
  } catch (error) {
    return errorResponse(req, error, "AO ATUALIZAR INTERAÇÕES DA NOTÍCIA")
  }
}
