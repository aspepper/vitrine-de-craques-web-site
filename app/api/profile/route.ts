import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { logApiError, errorResponse } from '@/lib/error'

const roleEnum = z.enum([
  'TORCEDOR',
  'ATLETA',
  'RESPONSAVEL',
  'IMPRENSA',
  'CLUBE',
  'AGENTE',
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
      await logApiError(req, error, 'AO CRIAR PERFIL')
      return NextResponse.json({ error: error.flatten() }, { status: 400 })
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
      await logApiError(req, error, 'AO ATUALIZAR PERFIL')
      return NextResponse.json({ error: error.flatten() }, { status: 400 })
    }
    return errorResponse(req, error, 'AO ATUALIZAR PERFIL')
  }
}
