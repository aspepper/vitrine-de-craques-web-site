import { NextResponse } from 'next/server'
import { z } from 'zod'

import prisma from '@/lib/db'
import { requireAdminSession } from '@/lib/admin-auth'
import { errorResponse } from '@/lib/error'

const listSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(12),
  search: z.string().optional(),
  status: z.enum(['all', 'blocked', 'appeal']).optional(),
})

export async function GET(req: Request) {
  try {
    await requireAdminSession()

    const { searchParams } = new URL(req.url)
    const parsed = listSchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      search: searchParams.get('search') ?? undefined,
      status: searchParams.get('status') ?? undefined,
    })

    const skip = (parsed.page - 1) * parsed.limit
    const searchTerm = parsed.search?.trim()

    const statusFilter = (() => {
      if (parsed.status === 'blocked') {
        return { visibilityStatus: 'BLOCKED' as const }
      }
      if (parsed.status === 'appeal') {
        return { blockAppealStatus: 'PENDING' as const }
      }
      return undefined
    })()

    const where = {
      ...(statusFilter ?? {}),
      ...(searchTerm
        ? {
            OR: [
              { title: { contains: searchTerm, mode: 'insensitive' as const } },
              {
                user: {
                  OR: [
                    { email: { contains: searchTerm, mode: 'insensitive' as const } },
                    { name: { contains: searchTerm, mode: 'insensitive' as const } },
                    {
                      profile: {
                        displayName: { contains: searchTerm, mode: 'insensitive' as const },
                      },
                    },
                  ],
                },
              },
            ],
          }
        : {}),
    }

    const [items, total] = await prisma.$transaction([
      prisma.video.findMany({
        where,
        skip,
        take: parsed.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              profile: { select: { displayName: true } },
            },
          },
        },
      }),
      prisma.video.count({ where }),
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

    return errorResponse(req, error, 'AO LISTAR VÍDEOS ADMINISTRATIVOS')
  }
}
