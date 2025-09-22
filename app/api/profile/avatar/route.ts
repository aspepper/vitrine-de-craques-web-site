import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { errorResponse } from '@/lib/error'

export const runtime = 'nodejs'

const MAX_FILE_SIZE = 6 * 1024 * 1024

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, avatarUrl: true },
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil não encontrado. Finalize seu cadastro antes de enviar uma foto.' },
        { status: 400 },
      )
    }

    const formData = await req.formData()
    const file = formData.get('avatar')

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Imagem obrigatória.' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Envie um arquivo de imagem válido.' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Envie imagens de até 6MB.' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const image = sharp(buffer).resize(512, 512, {
      fit: 'cover',
      position: 'centre',
    })

    const optimized = await image.webp({ quality: 92 }).toBuffer()

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'avatars')
    await fs.mkdir(uploadsDir, { recursive: true })

    const filename = `${session.user.id}-${randomUUID()}.webp`
    const filePath = path.join(uploadsDir, filename)
    await fs.writeFile(filePath, optimized)

    if (profile.avatarUrl && profile.avatarUrl.startsWith('/uploads/avatars/')) {
      const sanitized = profile.avatarUrl.replace(/^\/+/, '')
      const previousPath = path.join(process.cwd(), 'public', sanitized)
      fs.unlink(previousPath).catch(() => null)
    }

    const relativeUrl = `/uploads/avatars/${filename}`

    await prisma.profile.update({
      where: { userId: session.user.id },
      data: { avatarUrl: relativeUrl },
    })

    return NextResponse.json({ avatarUrl: relativeUrl })
  } catch (error) {
    return errorResponse(req, error, 'AO ATUALIZAR FOTO DO PERFIL')
  }
}
