import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { errorResponse } from '@/lib/error'

interface Params {
  params: { id: string }
}

export async function GET(req: Request, { params }: Params) {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: params.id },
    })
    if (!profile || profile.role !== 'AGENTE') {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(profile)
  } catch (error) {
    return errorResponse(req, error, 'AO BUSCAR AGENTE')
  }
}
