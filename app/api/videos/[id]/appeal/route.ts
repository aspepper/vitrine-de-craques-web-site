import { NextResponse } from 'next/server'
import { z } from 'zod'
import { VideoVisibilityStatus, VideoBlockAppealStatus, NotificationType } from '@prisma/client'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { ADMIN_ALLOWED_ROLES } from '@/lib/admin-auth'
import { errorResponse } from '@/lib/error'

const appealSchema = z.object({
  message: z.string().min(20).max(800),
})

interface RouteParams {
  params: { id: string }
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    }

    const body = await req.json()
    const { message } = appealSchema.parse(body)

    if (!params.id) {
      return NextResponse.json({ error: 'Identificador de vídeo inválido.' }, { status: 400 })
    }

    const video = await prisma.video.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        userId: true,
        title: true,
        visibilityStatus: true,
        blockReason: true,
        blockAppealStatus: true,
      },
    })

    if (!video || video.userId !== session.user.id) {
      return NextResponse.json({ error: 'Vídeo não encontrado.' }, { status: 404 })
    }

    if (video.visibilityStatus !== VideoVisibilityStatus.BLOCKED) {
      return NextResponse.json({ error: 'Este vídeo não está bloqueado.' }, { status: 400 })
    }

    if (video.blockAppealStatus === VideoBlockAppealStatus.PENDING) {
      return NextResponse.json({ error: 'Já existe uma contestação em análise.' }, { status: 400 })
    }

    const updatedVideo = await prisma.video.update({
      where: { id: video.id },
      data: {
        blockAppealMessage: message,
        blockAppealAt: new Date(),
        blockAppealStatus: VideoBlockAppealStatus.PENDING,
      },
      select: {
        id: true,
        blockAppealMessage: true,
        blockAppealStatus: true,
        blockAppealAt: true,
      },
    })

    const adminProfiles = await prisma.profile.findMany({
      where: { role: { in: ADMIN_ALLOWED_ROLES } },
      select: { userId: true },
    })

    if (adminProfiles.length > 0) {
      await prisma.notification.createMany({
        data: adminProfiles.map((profile) => ({
          userId: profile.userId,
          type: NotificationType.VIDEO_APPEAL_UPDATE,
          title: 'Nova contestação de vídeo',
          message: `O vídeo "${video.title}" recebeu uma contestação do proprietário. Analise o pedido.`,
          metadata: { videoId: video.id },
        })),
        skipDuplicates: true,
      })
    }

    return NextResponse.json({ video: updatedVideo })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 })
    }

    return errorResponse(req, error, 'AO REGISTRAR CONTESTAÇÃO DE VÍDEO')
  }
}
