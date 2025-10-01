import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  NotificationType,
  VideoBlockAppealStatus,
  VideoVisibilityStatus,
  Prisma,
} from '@prisma/client'

import prisma from '@/lib/db'
import { requireAdminSession } from '@/lib/admin-auth'
import { errorResponse } from '@/lib/error'

const appealDecisionSchema = z.object({
  decision: z.enum(['approve', 'reject']),
  response: z.string().min(10).max(500),
})

interface RouteParams {
  params: { videoId: string }
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const session = await requireAdminSession()
    const body = await req.json()
    const { decision, response } = appealDecisionSchema.parse(body)

    if (!params.videoId) {
      return NextResponse.json({ error: 'Identificador de vídeo inválido.' }, { status: 400 })
    }

    const video = await prisma.video.findUnique({
      where: { id: params.videoId },
      select: {
        id: true,
        title: true,
        userId: true,
        blockAppealStatus: true,
        visibilityStatus: true,
      },
    })

    if (!video) {
      return NextResponse.json({ error: 'Vídeo não encontrado.' }, { status: 404 })
    }

    if (video.blockAppealStatus !== VideoBlockAppealStatus.PENDING) {
      return NextResponse.json(
        { error: 'Este vídeo não possui uma contestação pendente.' },
        { status: 400 },
      )
    }

    const approve = decision === 'approve'
    const now = new Date()

    const updateData: Prisma.VideoUpdateInput = {
      blockAppealStatus: approve
        ? VideoBlockAppealStatus.APPROVED
        : VideoBlockAppealStatus.REJECTED,
      blockAppealResponse: response,
      blockAppealResolvedAt: now,
    }

    if (approve) {
      updateData.visibilityStatus = VideoVisibilityStatus.PUBLIC
      updateData.blockReason = null
      updateData.blockedAt = null
      updateData.blockedByAdminId = null
    } else {
      updateData.visibilityStatus = VideoVisibilityStatus.BLOCKED
      updateData.blockedByAdminId = session.user.id
    }

    const updatedVideo = await prisma.video.update({
      where: { id: video.id },
      data: updateData,
      select: {
        id: true,
        title: true,
        visibilityStatus: true,
        blockAppealStatus: true,
        blockAppealResponse: true,
        userId: true,
      },
    })

    await prisma.notification.create({
      data: {
        userId: updatedVideo.userId,
        type: NotificationType.VIDEO_APPEAL_UPDATE,
        title: approve ? 'Contestação aceita' : 'Contestação analisada',
        message: approve
          ? `Sua contestação do vídeo "${updatedVideo.title}" foi aceita. O vídeo voltou a ficar disponível.`
          : `Sua contestação do vídeo "${updatedVideo.title}" foi analisada, mas o bloqueio foi mantido. Resposta: ${response}`,
        metadata: { videoId: updatedVideo.id, decision },
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

    return errorResponse(req, error, 'AO ANALISAR CONTESTAÇÃO DE VÍDEO')
  }
}
