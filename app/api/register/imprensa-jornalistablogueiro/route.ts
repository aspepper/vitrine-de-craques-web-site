import { NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { Role } from '@prisma/client'

import prisma from '@/lib/db'
import { errorResponse, logApiError } from '@/lib/error'

const registerImprensaSchema = z
  .object({
    nomeSocial: z.string().optional(),
    nome: z.string().min(1),
    cpf: z.string().min(1),
    ddd: z.string().min(1),
    telefone: z.string().min(1),
    uf: z.string().min(1),
    cidade: z.string().min(1),
    email: z.string().email(),
    site: z.string().url().optional(),
    endereco: z.string().min(1),
    redesSociais: z.string().optional(),
    areaAtuacao: z.string().min(1),
    portfolio: z.string().url().optional(),
    termos: z.boolean(),
    senha: z.string().min(6),
    confirmarSenha: z.string().min(6),
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
    const payload = registerImprensaSchema.parse(body)

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
          role: Role.IMPRENSA,
          displayName: payload.nomeSocial ?? payload.nome,
          cpf: payload.cpf,
          ddd: payload.ddd,
          telefone: payload.telefone,
          uf: payload.uf,
          cidade: payload.cidade,
          site: payload.site,
          endereco: payload.endereco,
          redesSociais: payload.redesSociais,
          areaAtuacao: payload.areaAtuacao,
          portfolio: payload.portfolio,
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
        'AO REGISTRAR IMPRENSA',
      )
      return NextResponse.json(
        { error: error.flatten(), errorId },
        { status: 400 },
      )
    }

    return errorResponse(req, error, 'AO REGISTRAR IMPRENSA')
  }
}
