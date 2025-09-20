import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { errorResponse } from '@/lib/error'

export async function GET(req: NextRequest) {
  try {
    const page = parseInt(req.nextUrl.searchParams.get('page') || '1')
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '9')
    const skip = (page - 1) * limit

    const [items, total] = await prisma.$transaction([
      prisma.game.findMany({
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          author: { include: { profile: true } },
        },
      }),
      prisma.game.count(),
    ])

    return NextResponse.json({
      items,
      page,
      total,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    return errorResponse(req, error, 'AO BUSCAR JOGOS')
  }
}
