import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { errorResponse } from '@/lib/error'

interface Params {
  params: { slug: string }
}

export async function GET(req: Request, { params }: Params) {
  try {
    const club = await prisma.club.findUnique({
      where: { slug: params.slug },
      include: { confederation: true },
    })
    if (!club) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(club)
  } catch (error) {
    return errorResponse(req, error, 'AO BUSCAR CLUBE')
  }
}
