import { NextResponse } from 'next/server'
import { z } from 'zod'
import { NotificationType, UserStatus } from '@prisma/client'

import prisma from '@/lib/db'
import { requireAdminSession } from '@/lib/admin-auth'
import { errorResponse } from '@/lib/error'

const blockSchema = z.object({
  reason: z.string().min(10).max(500),
})

interface RouteParams {
  params: { userId: string }
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await requireAdminSession()
    const body = await req.json()
    const { reason } = blockSchema.parse(body)

    if (!params.userId) {
      return NextResponse.json({ error: 'Identificador de usuário inválido.' }, { status: 400 })
    }

    if (params.userId === session.user.id) {
      return NextResponse.json({ error: 'Você não pode bloquear sua própria conta.' }, { status: 400 })
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        status: true,
        profile: { select: { role: true, displayName: true } },
        email: true,
      },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })
    }

    if (targetUser.profile?.role === 'SUPER' && session.user.role !== 'SUPER') {
      return NextResponse.json({ error: 'Apenas usuários SUPER podem bloquear outras contas SUPER.' }, { status: 403 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUser.id },
      data: {
        status: UserStatus.BLOCKED,
        blockedReason: reason,
        blockedAt: new Date(),
        blockedByAdminId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        blockedReason: true,
        blockedAt: true,
        profile: { select: { role: true, displayName: true } },
      },
    })

    await prisma.notification.create({
      data: {
        userId: targetUser.id,
        type: NotificationType.USER_BLOCK,
        title: 'Sua conta foi bloqueada',
        message: `Sua conta foi bloqueada pela administração da plataforma. Motivo: ${reason}`,
      },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 })
    }

    const statusCode = (error as { statusCode?: number } | undefined)?.statusCode
    if (statusCode) {
      return NextResponse.json({ error: (error as Error).message }, { status: statusCode })
    }

    return errorResponse(req, error, 'AO BLOQUEAR USUÁRIO')
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    await requireAdminSession()

    if (!params.userId) {
      return NextResponse.json({ error: 'Identificador de usuário inválido.' }, { status: 400 })
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { id: true, status: true },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUser.id },
      data: {
        status: UserStatus.ACTIVE,
        blockedReason: null,
        blockedAt: null,
        blockedByAdminId: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        profile: { select: { role: true, displayName: true } },
      },
    })

    await prisma.notification.create({
      data: {
        userId: targetUser.id,
        type: NotificationType.USER_BLOCK,
        title: 'Sua conta foi reativada',
        message: 'A equipe administrativa reativou a sua conta. Você pode voltar a acessar a plataforma normalmente.',
      },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    const statusCode = (error as { statusCode?: number } | undefined)?.statusCode
    if (statusCode) {
      return NextResponse.json({ error: (error as Error).message }, { status: statusCode })
    }

    return errorResponse(req, error, 'AO DESBLOQUEAR USUÁRIO')
  }
}
