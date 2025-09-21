import { NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { Role } from '@prisma/client'

import prisma from '@/lib/db'
import { errorResponse, logApiError } from '@/lib/error'

const registerTorcedorSchema = z.object({
  nome: z.string().min(1),
  nascimento: z.string().min(1),
  cpf: z.string().min(1),
  genero: z.string().min(1),
  whatsapp: z.string().min(1),
  email: z.string().email(),
  senha: z.string().min(6),
  confirmarSenha: z.string().min(6),
  clubeId: z.string().min(1),
  uf: z.string().min(1),
  notifNovidades: z.boolean().optional(),
  notifJogos: z.boolean().optional(),
  notifEventos: z.boolean().optional(),
  notifAtletas: z.boolean().optional(),
  termos: z.boolean(),
  lgpdWhatsappNoticias: z.boolean().optional(),
  lgpdWhatsappConvites: z.boolean().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const payload = registerTorcedorSchema.parse(body)

    if (payload.senha !== payload.confirmarSenha) {
      return NextResponse.json(
        { error: 'As senhas não coincidem.' },
        { status: 400 },
      )
    }

    if (!payload.termos) {
      return NextResponse.json(
        { error: 'É necessário aceitar os termos de uso.' },
        { status: 400 },
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: payload.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'E-mail já cadastrado.' },
        { status: 409 },
      )
    }

    const favoriteClub = await prisma.times.findUnique({
      where: { id: payload.clubeId },
    })

    if (!favoriteClub) {
      return NextResponse.json(
        { error: 'Clube do coração inválido.' },
        { status: 400 },
      )
    }

    const hashedPassword = await bcrypt.hash(payload.senha, 10)

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name: payload.nome,
          email: payload.email,
          passwordHash: hashedPassword,
        },
      })

      await tx.profile.create({
        data: {
          userId: createdUser.id,
          role: Role.TORCEDOR,
          displayName: payload.nome,
          cpf: payload.cpf,
          nascimento: payload.nascimento,
          genero: payload.genero,
          whatsapp: payload.whatsapp,
          favoriteClubId: payload.clubeId,
          uf: payload.uf,
          notifNovidades: payload.notifNovidades ?? false,
          notifJogos: payload.notifJogos ?? false,
          notifEventos: payload.notifEventos ?? false,
          notifAtletas: payload.notifAtletas ?? false,
          termos: payload.termos,
          lgpdWhatsappNoticias: payload.lgpdWhatsappNoticias ?? false,
          lgpdWhatsappConvites: payload.lgpdWhatsappConvites ?? false,
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
        'AO REGISTRAR TORCEDOR',
      )
      return NextResponse.json(
        { error: error.flatten(), errorId },
        { status: 400 },
      )
    }

    return errorResponse(req, error, 'AO REGISTRAR TORCEDOR')
  }
}
