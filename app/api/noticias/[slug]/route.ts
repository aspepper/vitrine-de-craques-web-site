import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { errorResponse } from '@/lib/error'

interface Params {
  params: { slug: string }
}

export async function GET(req: Request, { params }: Params) {
  try {
    const news = await prisma.news.findUnique({
      where: { slug: params.slug },
      include: {
        author: {
          include: {
            profile: true,
          },
        },
      },
    })
    if (!news) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(news)
  } catch (error) {
    return errorResponse(req, error, 'AO BUSCAR NOTÍCIA')
  }
}
