import { NextResponse } from 'next/server'

import prisma from '@/lib/db'
import { requireAdminSession } from '@/lib/admin-auth'
import { errorResponse } from '@/lib/error'
import { uploadFile, deleteFileByUrl } from '@/lib/storage'
import { slugify } from '@/lib/slugify'

interface RouteParams {
  params: { id: string }
}

function getFileExtension(filename: string | undefined) {
  if (!filename || !filename.includes('.')) {
    return 'png'
  }
  const [, extension] = filename.toLowerCase().split(/\.(?=[^\.]+$)/)
  return extension || 'png'
}

function parseDateInput(value: string | null | undefined) {
  if (!value) {
    return null
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

type FileLike = Blob & { name?: string; type?: string }

function isFileLike(value: unknown): value is FileLike {
  if (!value || typeof value !== 'object') {
    return false
  }

  const maybeBlob = value as Blob
  return typeof maybeBlob.arrayBuffer === 'function' && typeof maybeBlob.size === 'number'
}

async function handleCrestUpload(file: FileLike | null, slug: string) {
  if (!file || file.size === 0) {
    return null
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const extension = getFileExtension(file.name)
  const crestKey = `uploads/clubs/${slug}-${Date.now()}.${extension}`
  const upload = await uploadFile({
    key: crestKey,
    data: buffer,
    contentType: file.type || 'image/png',
    cacheControl: 'public, max-age=31536000',
  })
  return upload.url
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    await requireAdminSession()

    const club = await prisma.club.findUnique({ where: { id: params.id } })
    if (!club) {
      return NextResponse.json({ error: 'Clube não encontrado.' }, { status: 404 })
    }

    const formData = await req.formData()
    const updates: Record<string, unknown> = {}

    const name = formData.get('name')?.toString().trim()
    if (name && name !== club.name) {
      updates.name = name
      updates.slug = slugify(name)
    }

    const nickname = formData.get('nickname')?.toString().trim()
    if (nickname !== undefined) {
      updates.nickname = nickname || null
    }

    const stadium = formData.get('stadium')?.toString().trim()
    if (stadium !== undefined) {
      updates.stadium = stadium || null
    }

    const city = formData.get('city')?.toString().trim()
    if (city !== undefined) {
      updates.city = city || null
    }

    const state = formData.get('state')?.toString().trim()
    if (state !== undefined) {
      updates.state = state || null
    }

    const colors = formData.get('colors')?.toString().trim()
    if (colors !== undefined) {
      updates.colors = colors || null
    }

    const website = formData.get('website')?.toString().trim()
    if (website !== undefined) {
      updates.website = website || null
    }

    const description = formData.get('description')?.toString().trim()
    if (description !== undefined) {
      updates.description = description || null
    }

    const confederationId = formData.get('confederationId')?.toString().trim()
    if (confederationId !== undefined) {
      updates.confederationId = confederationId || null
    }

    const foundedAt = parseDateInput(formData.get('foundedAt')?.toString())
    if (formData.has('foundedAt')) {
      updates.foundedAt = foundedAt
    }

    const crestFile = formData.get('crest')
    if (isFileLike(crestFile) && crestFile.size > 0) {
      const newSlug = (updates.slug as string | undefined) ?? club.slug
      const crestUrl = await handleCrestUpload(crestFile, newSlug)
      if (crestUrl) {
        if (club.crestUrl) {
          await deleteFileByUrl(club.crestUrl)
        }
        updates.crestUrl = crestUrl
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ club }, { status: 200 })
    }

    const updatedClub = await prisma.club.update({
      where: { id: club.id },
      data: updates,
      include: { confederation: { select: { id: true, name: true } } },
    })

    return NextResponse.json({ club: updatedClub })
  } catch (error) {
    const statusCode = (error as { statusCode?: number } | undefined)?.statusCode
    if (statusCode) {
      return NextResponse.json({ error: (error as Error).message }, { status: statusCode })
    }

    return errorResponse(req, error, 'AO ATUALIZAR CLUBE')
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    await requireAdminSession()

    const club = await prisma.club.findUnique({ where: { id: params.id } })
    if (!club) {
      return NextResponse.json({ error: 'Clube não encontrado.' }, { status: 404 })
    }

    await prisma.club.delete({ where: { id: club.id } })

    if (club.crestUrl) {
      await deleteFileByUrl(club.crestUrl)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const statusCode = (error as { statusCode?: number } | undefined)?.statusCode
    if (statusCode) {
      return NextResponse.json({ error: (error as Error).message }, { status: statusCode })
    }

    return errorResponse(req, error, 'AO REMOVER CLUBE')
  }
}
