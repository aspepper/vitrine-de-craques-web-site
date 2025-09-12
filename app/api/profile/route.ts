import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

const roleEnum = z.enum(['TORCEDOR','ATLETA','RESPONSAVEL','IMPRENSA','CLUBE','AGENTE'])

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const schema = z.object({ role: roleEnum, data: z.record(z.any()) })
  const { role, data } = schema.parse(body)

  const profile = await prisma.profile.upsert({
    where: { userId: session.user.id },
    update: { role, data },
    create: { userId: session.user.id, role, data }
  })

  return NextResponse.json(profile)
}
