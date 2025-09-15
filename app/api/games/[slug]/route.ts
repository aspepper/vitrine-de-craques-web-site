import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { errorResponse } from '@/lib/error'

interface Params {
  params: { slug: string }
}

export async function GET(req: Request, { params }: Params) {
  try {
    const game = await prisma.game.findUnique({
      where: { slug: params.slug },
      include: { homeClub: true, awayClub: true },
    })
    if (!game) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(game)
  } catch (error) {
    return errorResponse(req, error, 'AO BUSCAR JOGO')
  }
}
