import { NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { Role } from '@prisma/client'

import prisma from '@/lib/db'
import { errorResponse, logApiError } from '@/lib/error'

const registerResponsavelSchema = z
  .object({
    responsavelNome: z.string().min(1),
    responsavelCpf: z.string().min(1),
    responsavelNascimento: z.string().min(1),
    responsavelGenero: z.string().min(1),
    responsavelWhatsapp: z.string().min(1),
    responsavelEmail: z.string().email(),
    responsavelInstagram: z.string().optional(),
    atletaNome: z.string().min(1),
    atletaCpf: z.string().min(1),
    atletaNascimento: z.string().min(1),
    atletaGenero: z.string().min(1),
    atletaEsporte: z.string().min(1),
    atletaModalidade: z.string().min(1),
    atletaObservacoes: z.string().optional(),
    senha: z.string().min(6),
    confirmarSenha: z.string().min(6),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    path: ['confirmarSenha'],
    message: 'As senhas não coincidem.',
  })

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const payload = registerResponsavelSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email: payload.responsavelEmail },
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
          name: payload.responsavelNome,
          email: payload.responsavelEmail,
          passwordHash,
        },
      })

      await tx.profile.create({
        data: {
          userId: createdUser.id,
          role: Role.RESPONSAVEL,
          displayName: payload.responsavelNome,
          cpf: payload.responsavelCpf,
          nascimento: payload.responsavelNascimento,
          genero: payload.responsavelGenero,
          whatsapp: payload.responsavelWhatsapp,
          responsavelNascimento: payload.responsavelNascimento,
          responsavelGenero: payload.responsavelGenero,
          responsavelInstagram: payload.responsavelInstagram,
          atletaNome: payload.atletaNome,
          atletaCpf: payload.atletaCpf,
          atletaNascimento: payload.atletaNascimento,
          atletaGenero: payload.atletaGenero,
          atletaEsporte: payload.atletaEsporte,
          atletaModalidade: payload.atletaModalidade,
          atletaObservacoes: payload.atletaObservacoes,
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
        'AO REGISTRAR RESPONSAVEL',
      )
      return NextResponse.json(
        { error: error.flatten(), errorId },
        { status: 400 },
      )
    }

    return errorResponse(req, error, 'AO REGISTRAR RESPONSAVEL')
  }
}
