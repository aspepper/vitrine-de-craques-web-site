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
    const game = await prisma.game.findUnique({
      where: { slug: params.slug },
      select: {
        id: true,
        likesCount: true,
        savesCount: true,
        commentsCount: true,
      },
    })

    if (!game) {
      return NextResponse.json({ error: "Game não encontrado" }, { status: 404 })
    }

    const userId = session?.user?.id
    let userState: { liked: boolean; saved: boolean } | null = null

    if (userId) {
      const [like, save] = await Promise.all([
        prisma.gameLike.findUnique({
          where: {
            gameId_userId: {
              gameId: game.id,
              userId,
            },
          },
        }),
        prisma.gameSave.findUnique({
          where: {
            gameId_userId: {
              gameId: game.id,
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
        likes: game.likesCount,
        saves: game.savesCount,
        comments: game.commentsCount,
        shares: 0,
      },
      user: userState,
    })
  } catch (error) {
    return errorResponse(req, error, "AO BUSCAR INTERAÇÕES DO GAME")
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    const payload = actionSchema.parse(await req.json())

    const game = await prisma.game.findUnique({
      where: { slug: params.slug },
      select: {
        id: true,
        likesCount: true,
        savesCount: true,
        commentsCount: true,
      },
    })

    if (!game) {
      return NextResponse.json({ error: "Game não encontrado" }, { status: 404 })
    }

    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const [existingLike, existingSave] = await Promise.all([
      prisma.gameLike.findUnique({
        where: {
          gameId_userId: {
            gameId: game.id,
            userId,
          },
        },
      }),
      prisma.gameSave.findUnique({
        where: {
          gameId_userId: {
            gameId: game.id,
            userId,
          },
        },
      }),
    ])

    let likesCount = game.likesCount
    let savesCount = game.savesCount
    const commentsCount = game.commentsCount
    let liked = Boolean(existingLike)
    let saved = Boolean(existingSave)

    if (payload.action === "like") {
      const enable = payload.enabled ?? !existingLike

      if (enable && !existingLike) {
        const [, updated] = await prisma.$transaction([
          prisma.gameLike.create({
            data: {
              gameId: game.id,
              userId,
            },
          }),
          prisma.game.update({
            where: { id: game.id },
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
          prisma.gameLike.delete({ where: { id: existingLike.id } }),
          prisma.game.update({
            where: { id: game.id },
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
          prisma.gameSave.create({
            data: {
              gameId: game.id,
              userId,
            },
          }),
          prisma.game.update({
            where: { id: game.id },
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
          prisma.gameSave.delete({ where: { id: existingSave.id } }),
          prisma.game.update({
            where: { id: game.id },
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
    return errorResponse(req, error, "AO ATUALIZAR INTERAÇÕES DO GAME")
  }
}
