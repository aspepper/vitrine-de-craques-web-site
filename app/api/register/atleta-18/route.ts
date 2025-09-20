import { NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { Role } from '@prisma/client'

import prisma from '@/lib/db'
import { errorResponse, logApiError } from '@/lib/error'

const registerAtletaSchema = z
  .object({
    nome: z.string().min(1),
    cpf: z.string().min(1),
    pais: z.string().min(1),
    uf: z.string().min(1),
    altura: z.string().optional(),
    peso: z.string().optional(),
    posicao: z.string().min(1),
    perna: z.string().min(1),
    cidade: z.string().min(1),
    email: z.string().email(),
    senha: z.string().min(6),
    confirmarSenha: z.string().min(6),
    termos: z.boolean(),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    path: ['confirmarSenha'],
    message: 'As senhas não coincidem.',
  })
  .refine((data) => data.termos, {
    path: ['termos'],
    message: 'É necessário aceitar os termos.',
  })

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const payload = registerAtletaSchema.parse(body)

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
          role: Role.ATLETA,
          displayName: payload.nome,
          cpf: payload.cpf,
          pais: payload.pais,
          uf: payload.uf,
          altura: payload.altura,
          peso: payload.peso,
          posicao: payload.posicao,
          perna: payload.perna,
          cidade: payload.cidade,
          termos: payload.termos,
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
        'AO REGISTRAR ATLETA',
      )
      return NextResponse.json(
        { error: error.flatten(), errorId },
        { status: 400 },
      )
    }

    return errorResponse(req, error, 'AO REGISTRAR ATLETA')
  }
}
