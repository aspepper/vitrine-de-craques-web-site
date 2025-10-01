import { NextResponse } from 'next/server'
import { z } from 'zod'

import prisma from '@/lib/db'
import { requireAdminSession } from '@/lib/admin-auth'
import { errorResponse } from '@/lib/error'
import { uploadFile } from '@/lib/storage'
import { slugify } from '@/lib/slugify'

const clubSearchSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
})

function getFileExtension(filename: string | undefined) {
  if (!filename || !filename.includes('.')) {
    return 'png'
  }
  const [, extension] = filename.toLowerCase().split(/\.(?=[^\.]+$)/)
  return extension || 'png'
}

async function handleCrestUpload(file: File | null, slug: string) {
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

function parseDateInput(value: string | null | undefined) {
  if (!value) {
    return null
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export async function GET(req: Request) {
  try {
    await requireAdminSession()

    const { searchParams } = new URL(req.url)
    const parsed = clubSearchSchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      search: searchParams.get('search') ?? undefined,
    })

    const skip = (parsed.page - 1) * parsed.limit
    const search = parsed.search?.trim()

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { nickname: { contains: search, mode: 'insensitive' as const } },
            { city: { contains: search, mode: 'insensitive' as const } },
            { state: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : undefined

    const [items, total] = await prisma.$transaction([
      prisma.club.findMany({
        where,
        skip,
        take: parsed.limit,
        orderBy: { name: 'asc' },
        include: { confederation: { select: { id: true, name: true } } },
      }),
      prisma.club.count({ where }),
    ])

    return NextResponse.json({
      items,
      page: parsed.page,
      total,
      totalPages: Math.max(1, Math.ceil(total / parsed.limit)),
    })
  } catch (error) {
    const statusCode = (error as { statusCode?: number } | undefined)?.statusCode
    if (statusCode) {
      return NextResponse.json({ error: (error as Error).message }, { status: statusCode })
    }

    return errorResponse(req, error, 'AO LISTAR CLUBES ADMINISTRATIVOS')
  }
}

export async function POST(req: Request) {
  try {
    await requireAdminSession()
    const formData = await req.formData()

    const name = String(formData.get('name') ?? '').trim()
    if (!name) {
      return NextResponse.json({ error: 'Informe o nome do clube.' }, { status: 400 })
    }

    const slug = slugify(name)

    const crestFile = formData.get('crest')
    const crestUrl =
      crestFile instanceof File && crestFile.size > 0 ? await handleCrestUpload(crestFile, slug) : null

    const foundedAt = parseDateInput(formData.get('foundedAt')?.toString())

    const createdClub = await prisma.club.create({
      data: {
        name,
        slug,
        nickname: formData.get('nickname')?.toString().trim() || null,
        stadium: formData.get('stadium')?.toString().trim() || null,
        city: formData.get('city')?.toString().trim() || null,
        state: formData.get('state')?.toString().trim() || null,
        colors: formData.get('colors')?.toString().trim() || null,
        website: formData.get('website')?.toString().trim() || null,
        description: formData.get('description')?.toString().trim() || null,
        confederationId: formData.get('confederationId')?.toString().trim() || null,
        foundedAt,
        crestUrl,
      },
      include: { confederation: { select: { id: true, name: true } } },
    })

    return NextResponse.json({ club: createdClub }, { status: 201 })
  } catch (error) {
    const statusCode = (error as { statusCode?: number } | undefined)?.statusCode
    if (statusCode) {
      return NextResponse.json({ error: (error as Error).message }, { status: statusCode })
    }

    return errorResponse(req, error, 'AO CRIAR CLUBE')
  }
}
