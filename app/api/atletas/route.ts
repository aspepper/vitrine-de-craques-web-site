import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { errorResponse } from '@/lib/error'

export async function GET(req: NextRequest) {
  try {
    const page = parseInt(req.nextUrl.searchParams.get('page') || '1')
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const [items, total] = await prisma.$transaction([
      prisma.profile.findMany({
        where: { role: 'ATLETA' },
        skip,
        take: limit,
        orderBy: { displayName: 'asc' },
      }),
      prisma.profile.count({ where: { role: 'ATLETA' } }),
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
