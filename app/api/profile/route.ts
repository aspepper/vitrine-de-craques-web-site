import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { logApiError, errorResponse } from '@/lib/error'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        role: true,
        displayName: true,
        avatarUrl: true,
        user: {
          select: {
            image: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({ profile })
  } catch (error) {
    return errorResponse(req, error, 'AO BUSCAR PERFIL')
  }
}

const roleEnum = z.enum([
  'TORCEDOR',
  'ATLETA',
  'RESPONSAVEL',
  'IMPRENSA',
  'CLUBE',
  'AGENTE',
  'ADMINISTRADOR',
  'SUPER',
  'MODERADOR',
])

const schema = z.object({ role: roleEnum, data: z.record(z.any()) })

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { role, data } = schema.parse(body)

    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: { role, data },
      create: { userId: session.user.id, role, data },
    })

    return NextResponse.json(profile)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const { errorId } = await logApiError(req, error, 'AO CRIAR PERFIL')
      return NextResponse.json(
        { error: error.flatten(), errorId },
        { status: 400 },
      )
    }
    return errorResponse(req, error, 'AO CRIAR PERFIL')
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { role, data } = schema.parse(body)

    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: { role, data },
      create: { userId: session.user.id, role, data },
    })

    return NextResponse.json(profile)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const { errorId } = await logApiError(req, error, 'AO ATUALIZAR PERFIL')
      return NextResponse.json(
        { error: error.flatten(), errorId },
        { status: 400 },
      )
    }
    return errorResponse(req, error, 'AO ATUALIZAR PERFIL')
  }
}
