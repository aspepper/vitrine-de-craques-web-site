import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { CommentItemType } from "@prisma/client"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { errorResponse } from "@/lib/error"
import {
  commentAuthorSelect,
  fetchCommentThreads,
  fetchSingleComment,
} from "@/lib/comments"
import type { CommentReply, CommentThread } from "@/types/comments"

const createCommentSchema = z.object({
  content: z.string().trim().min(1).max(2000),
  parentId: z.string().trim().optional(),
})

interface Params {
  params: { id: string }
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const comments = await fetchCommentThreads(CommentItemType.VIDEO, params.id)
    return NextResponse.json(comments)
  } catch (error) {
    return errorResponse(req, error, "AO BUSCAR COMENTÁRIOS DO VÍDEO")
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const payload = createCommentSchema.parse(await req.json())
    const video = await prisma.video.findUnique({
      where: { id: params.id },
      select: { id: true },
    })

    if (!video) {
      return NextResponse.json({ error: "Vídeo não encontrado" }, { status: 404 })
    }

    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    })

    let parentComment = null
    if (payload.parentId) {
      parentComment = await fetchSingleComment(payload.parentId)
      if (
        !parentComment ||
        parentComment.itemType !== CommentItemType.VIDEO ||
        parentComment.itemId !== params.id
      ) {
        return NextResponse.json({ error: "Comentário original não encontrado" }, { status: 400 })
      }
    }

    const authorName =
      profile?.displayName?.trim() ||
      profile?.user?.name?.trim() ||
      session.user?.name?.trim() ||
      "Participante"
    const authorAvatarUrl = profile?.avatarUrl ?? profile?.user?.image ?? session.user?.image ?? null

    const [createdComment, updatedVideo] = await prisma.$transaction([
      prisma.comment.create({
        data: {
          itemType: CommentItemType.VIDEO,
          itemId: video.id,
          content: payload.content.trim(),
          parent: parentComment ? { connect: { id: parentComment.id } } : undefined,
          authorProfile: profile ? { connect: { id: profile.id } } : undefined,
          authorName,
          authorAvatarUrl,
        },
        include: {
          authorProfile: {
            select: commentAuthorSelect,
          },
        },
      }),
      prisma.video.update({
        where: { id: video.id },
        data: {
          commentsCount: { increment: 1 },
        },
        select: { commentsCount: true },
      }),
    ])

    const baseComment: CommentReply = {
      id: createdComment.id,
      authorName:
        createdComment.authorName?.trim() ||
        createdComment.authorProfile?.displayName?.trim() ||
        createdComment.authorProfile?.user?.name?.trim() ||
        "Participante",
      authorAvatarUrl:
        createdComment.authorAvatarUrl ??
        createdComment.authorProfile?.avatarUrl ??
        createdComment.authorProfile?.user?.image ??
        null,
      content: createdComment.content.trim(),
      createdAt: createdComment.createdAt ? createdComment.createdAt.toISOString() : null,
    }

    if (parentComment) {
      return NextResponse.json({
        reply: baseComment,
        parentId: parentComment.id,
        totalCount: updatedVideo.commentsCount,
      })
    }

    return NextResponse.json({
      comment: { ...baseComment, replies: [] as CommentThread["replies"] },
      totalCount: updatedVideo.commentsCount,
    })
  } catch (error) {
    return errorResponse(req, error, "AO PUBLICAR COMENTÁRIO DO VÍDEO")
  }
}
