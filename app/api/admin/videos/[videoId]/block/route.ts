import { NextResponse } from 'next/server'
import { z } from 'zod'
import { NotificationType, VideoVisibilityStatus } from '@prisma/client'

import prisma from '@/lib/db'
import { requireAdminSession } from '@/lib/admin-auth'
import { errorResponse } from '@/lib/error'

const blockVideoSchema = z.object({
  reason: z.string().min(10).max(500),
})

interface RouteParams {
  params: { videoId: string }
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await requireAdminSession()
    const body = await req.json()
    const { reason } = blockVideoSchema.parse(body)

    if (!params.videoId) {
      return NextResponse.json({ error: 'Identificador de vídeo inválido.' }, { status: 400 })
    }

    const video = await prisma.video.findUnique({
      where: { id: params.videoId },
      select: {
        id: true,
        title: true,
        userId: true,
        visibilityStatus: true,
        blockAppealStatus: true,
      },
    })

    if (!video) {
      return NextResponse.json({ error: 'Vídeo não encontrado.' }, { status: 404 })
    }

    const updatedVideo = await prisma.video.update({
      where: { id: video.id },
      data: {
        visibilityStatus: VideoVisibilityStatus.BLOCKED,
        blockReason: reason,
        blockedAt: new Date(),
        blockedByAdminId: session.user.id,
        blockAppealStatus: null,
        blockAppealMessage: null,
        blockAppealAt: null,
        blockAppealResponse: null,
        blockAppealResolvedAt: null,
      },
      select: {
        id: true,
        title: true,
        visibilityStatus: true,
        blockReason: true,
        blockedAt: true,
        userId: true,
      },
    })

    await prisma.notification.create({
      data: {
        userId: updatedVideo.userId,
        type: NotificationType.VIDEO_BLOCK,
        title: 'Um dos seus vídeos foi bloqueado',
        message: `O vídeo "${updatedVideo.title}" foi bloqueado pela moderação. Motivo: ${reason}`,
        metadata: { videoId: updatedVideo.id },
      },
    })

    return NextResponse.json({ video: updatedVideo })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 })
    }

    const statusCode = (error as { statusCode?: number } | undefined)?.statusCode
    if (statusCode) {
      return NextResponse.json({ error: (error as Error).message }, { status: statusCode })
    }

    return errorResponse(req, error, 'AO BLOQUEAR VÍDEO')
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    await requireAdminSession()

    if (!params.videoId) {
      return NextResponse.json({ error: 'Identificador de vídeo inválido.' }, { status: 400 })
    }

    const video = await prisma.video.findUnique({
      where: { id: params.videoId },
      select: {
        id: true,
        title: true,
        userId: true,
        visibilityStatus: true,
      },
    })

    if (!video) {
      return NextResponse.json({ error: 'Vídeo não encontrado.' }, { status: 404 })
    }

    const updatedVideo = await prisma.video.update({
      where: { id: video.id },
      data: {
        visibilityStatus: VideoVisibilityStatus.PUBLIC,
        blockReason: null,
        blockedAt: null,
        blockedByAdminId: null,
        blockAppealStatus: null,
        blockAppealMessage: null,
        blockAppealAt: null,
        blockAppealResponse: null,
        blockAppealResolvedAt: null,
      },
      select: {
        id: true,
        title: true,
        visibilityStatus: true,
        userId: true,
      },
    })

    await prisma.notification.create({
      data: {
        userId: updatedVideo.userId,
        type: NotificationType.VIDEO_APPEAL_UPDATE,
        title: 'Vídeo liberado',
        message: `O vídeo "${updatedVideo.title}" voltou a ficar disponível na plataforma.`,
        metadata: { videoId: updatedVideo.id },
      },
    })

    return NextResponse.json({ video: updatedVideo })
  } catch (error) {
    const statusCode = (error as { statusCode?: number } | undefined)?.statusCode
    if (statusCode) {
      return NextResponse.json({ error: (error as Error).message }, { status: statusCode })
    }

    return errorResponse(req, error, 'AO DESBLOQUEAR VÍDEO')
  }
}
