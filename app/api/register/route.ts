import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { z } from 'zod'
import prisma from '@/lib/db'
import { logApiError, errorResponse } from '@/lib/error'

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password } = registerSchema.parse(body)

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 },
      )
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    })

    return NextResponse.json(
      { id: user.id, email: user.email, name: user.name },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      await logApiError(req, error, 'AO REGISTRAR USUÁRIO')
      return NextResponse.json({ error: error.flatten() }, { status: 400 })
    }
    return errorResponse(req, error, 'AO REGISTRAR USUÁRIO')
  }
}
