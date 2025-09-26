import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { errorResponse } from '@/lib/error'
import { deleteFileByUrl, uploadFile } from '@/lib/storage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_FILE_SIZE = 6 * 1024 * 1024

function getExtensionFromContentType(contentType: string | undefined | null) {
  if (!contentType) {
    return 'bin'
  }

  switch (contentType) {
    case 'image/png':
      return 'png'
    case 'image/jpeg':
      return 'jpg'
    case 'image/jpg':
      return 'jpg'
    case 'image/gif':
      return 'gif'
    case 'image/webp':
      return 'webp'
    case 'image/avif':
      return 'avif'
    default: {
      const [type, subtype] = contentType.split('/')
      if (type === 'image' && subtype) {
        return subtype
      }
      return 'bin'
    }
  }
}

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

    let optimizedBuffer: Buffer<ArrayBufferLike> = buffer
    let contentType = file.type || 'application/octet-stream'
    let extension = getExtensionFromContentType(contentType)

    try {
      const sharpModule = await import('sharp')
      const image = sharpModule.default(buffer).resize(512, 512, {
        fit: 'cover',
        position: 'centre',
      })

      optimizedBuffer = await image.webp({ quality: 92 }).toBuffer()
      contentType = 'image/webp'
      extension = 'webp'
    } catch (error) {
      console.warn(
        'Sharp não disponível ou falhou ao processar avatar. Usando imagem original.',
        error instanceof Error ? error.message : error,
      )
    }

    const filename = `${session.user.id}-${randomUUID()}.${extension}`
    const key = `uploads/avatars/${filename}`
    const { url } = await uploadFile({
      key,
      data: optimizedBuffer,
      contentType,
      cacheControl: 'public, max-age=31536000, immutable',
    })

    if (profile.avatarUrl) {
      await deleteFileByUrl(profile.avatarUrl)
    }

    await prisma.profile.update({
      where: { userId: session.user.id },
      data: { avatarUrl: url },
    })

    return NextResponse.json({ avatarUrl: url })
  } catch (error) {
    return errorResponse(req, error, 'AO ATUALIZAR FOTO DO PERFIL')
  }
}
