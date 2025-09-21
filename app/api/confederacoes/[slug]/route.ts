import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { errorResponse } from '@/lib/error'

interface Params {
  params: { slug: string }
}

export async function GET(req: Request, { params }: Params) {
  try {
    const confed = await prisma.confederation.findUnique({
      where: { slug: params.slug },
      include: { clubs: { orderBy: { name: 'asc' } } },
    })
    if (!confed) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(confed)
  } catch (error) {
    return errorResponse(req, error, 'AO BUSCAR CONFEDERAÇÃO')
  }
}
