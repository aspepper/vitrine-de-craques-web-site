import { NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { Role } from '@prisma/client'

import prisma from '@/lib/db'
import { errorResponse, logApiError } from '@/lib/error'

const registerClubeSchema = z
  .object({
    nomeClube: z.string().min(1),
    nomeFantasia: z.string().optional(),
    telefone: z.string().min(1),
    emailClube: z.string().email(),
    uf: z.string().min(1),
    cidade: z.string().min(1),
    cnpj: z.string().min(1),
    inscricaoEstadual: z.string().optional(),
    representanteNome: z.string().min(1),
    representanteCpf: z.string().min(1),
    representanteEmail: z.string().email(),
    whatsapp: z.string().min(1),
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
    const payload = registerClubeSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email: payload.emailClube },
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
          name: payload.nomeClube,
          email: payload.emailClube,
          passwordHash,
        },
      })

      await tx.profile.create({
        data: {
          userId: createdUser.id,
          role: Role.CLUBE,
          displayName: payload.nomeClube,
          nomeFantasia: payload.nomeFantasia,
          telefone: payload.telefone,
          emailClube: payload.emailClube,
          uf: payload.uf,
          cidade: payload.cidade,
          cnpj: payload.cnpj,
          inscricaoEstadual: payload.inscricaoEstadual,
          representanteNome: payload.representanteNome,
          representanteCpf: payload.representanteCpf,
          representanteEmail: payload.representanteEmail,
          whatsapp: payload.whatsapp,
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
        'AO REGISTRAR CLUBE',
      )
      return NextResponse.json(
        { error: error.flatten(), errorId },
        { status: 400 },
      )
    }

    return errorResponse(req, error, 'AO REGISTRAR CLUBE')
  }
}
