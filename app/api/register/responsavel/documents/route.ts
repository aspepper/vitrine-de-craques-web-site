import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'

import prisma from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { errorResponse, logApiError } from '@/lib/error'

const documentsSchema = z.object({
  docResponsavel: z.string().nullable().optional(),
  docMenor: z.string().nullable().optional(),
  certidao: z.string().nullable().optional(),
  comprovante: z.string().nullable().optional(),
  consentimento1: z.boolean(),
  consentimento2: z.boolean(),
  consentimento3: z.boolean(),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const payload = documentsSchema.parse(body)

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil não encontrado.' },
        { status: 404 },
      )
    }

    const currentData = (profile.data as Record<string, unknown> | null) ?? {}

    const updatedProfile = await prisma.profile.update({
      where: { userId: session.user.id },
      data: {
        data: {
          ...currentData,
          documents: {
            docResponsavel: payload.docResponsavel ?? null,
            docMenor: payload.docMenor ?? null,
            certidao: payload.certidao ?? null,
            comprovante: payload.comprovante ?? null,
          },
          consentimentos: {
            consentimento1: payload.consentimento1,
            consentimento2: payload.consentimento2,
            consentimento3: payload.consentimento3,
          },
        },
        termos: payload.consentimento3,
      },
    })

    return NextResponse.json(updatedProfile)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const { errorId } = await logApiError(
        req,
        error,
        'AO SALVAR DOCUMENTOS RESPONSAVEL',
      )
      return NextResponse.json(
        { error: error.flatten(), errorId },
        { status: 400 },
      )
    }

    return errorResponse(req, error, 'AO SALVAR DOCUMENTOS RESPONSAVEL')
  }
}
