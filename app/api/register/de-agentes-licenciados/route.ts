import { NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { Role } from '@prisma/client'

import prisma from '@/lib/db'
import { errorResponse, logApiError } from '@/lib/error'

const registerAgenteSchema = z
  .object({
    nome: z.string().min(1),
    cpf: z.string().regex(/^\d{11}$/),
    email: z.string().email(),
    registroCbf: z.string().min(1),
    telefone: z.string().min(1),
    registroFifa: z.string().min(1),
    possuiLicenca: z.boolean(),
    aceitaRemuneracao: z.boolean(),
    termos: z.boolean(),
    senha: z.string().min(6),
    confirmarSenha: z.string().min(6),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    path: ['confirmarSenha'],
    message: 'As senhas não coincidem.',
  })
  .refine((data) => data.possuiLicenca, {
    path: ['possuiLicenca'],
    message: 'É necessário confirmar a licença.',
  })
  .refine((data) => data.aceitaRemuneracao, {
    path: ['aceitaRemuneracao'],
    message: 'É necessário aceitar os termos de remuneração.',
  })
  .refine((data) => data.termos, {
    path: ['termos'],
    message: 'É necessário aceitar os termos.',
  })

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const payload = registerAgenteSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email: payload.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'E-mail já cadastrado.' },
        { status: 409 },
      )
    }

    const passwordHash = await bcrypt.hash(payload.senha, 10)

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name: payload.nome,
          email: payload.email,
          passwordHash,
        },
      })

      await tx.profile.create({
        data: {
          userId: createdUser.id,
          role: Role.AGENTE,
          displayName: payload.nome,
          cpf: payload.cpf,
          telefone: payload.telefone,
          registroCbf: payload.registroCbf,
          registroFifa: payload.registroFifa,
          termos: payload.termos,
          data: {
            possuiLicenca: payload.possuiLicenca,
            aceitaRemuneracao: payload.aceitaRemuneracao,
          },
        },
      })

      return createdUser
    })

    return NextResponse.json(
      { id: user.id, email: user.email, name: user.name },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      const { errorId } = await logApiError(
        req,
        error,
        'AO REGISTRAR AGENTE',
      )
      return NextResponse.json(
        { error: error.flatten(), errorId },
        { status: 400 },
      )
    }

    return errorResponse(req, error, 'AO REGISTRAR AGENTE')
  }
}
