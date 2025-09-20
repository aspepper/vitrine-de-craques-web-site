import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { errorResponse } from '@/lib/error'

export async function GET(req: NextRequest) {
  try {
    const page = parseInt(req.nextUrl.searchParams.get('page') || '1')
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    const search = req.nextUrl.searchParams.get('search')?.trim() || ''

    const where = {
      role: 'ATLETA' as const,
      ...(search
        ? {
            AND: [
              {
                OR: [
                  { displayName: { contains: search, mode: 'insensitive' as const } },
                  { cidade: { contains: search, mode: 'insensitive' as const } },
                  { uf: { contains: search, mode: 'insensitive' as const } },
                  { clube: { contains: search, mode: 'insensitive' as const } },
                  { pais: { contains: search, mode: 'insensitive' as const } },
                  { nascimento: { contains: search, mode: 'insensitive' as const } },
                ],
              },
            ],
          }
        : {}),
    }

    const [items, total] = await prisma.$transaction([
      prisma.profile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { displayName: 'asc' },
      }),
      prisma.profile.count({ where }),
    ])

    return NextResponse.json({
      items,
      page,
      total,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    return errorResponse(req, error, 'AO BUSCAR ATLETAS')
  }
}
