import { NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { Role } from '@prisma/client'

import prisma from '@/lib/db'
import { requireAdminSession } from '@/lib/admin-auth'
import { errorResponse } from '@/lib/error'

const createUserSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: z.nativeEnum(Role),
})

function buildUserWhere(search: string | undefined) {
  if (!search) {
    return undefined
  }

  const normalized = search.trim()
  if (!normalized) {
    return undefined
  }

  return {
    OR: [
      { name: { contains: normalized, mode: 'insensitive' as const } },
      { email: { contains: normalized, mode: 'insensitive' as const } },
      {
        profile: {
          displayName: { contains: normalized, mode: 'insensitive' as const },
        },
      },
    ],
  }
}

export async function GET(req: Request) {
  try {
    await requireAdminSession()

    const { searchParams } = new URL(req.url)
    const page = Math.max(parseInt(searchParams.get('page') ?? '1', 10) || 1, 1)
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') ?? '20', 10) || 20, 1), 100)
    const search = searchParams.get('search') ?? undefined
    const skip = (page - 1) * limit

    const where = buildUserWhere(search)

    const [items, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          blockedReason: true,
          blockedAt: true,
          lastWebLoginAt: true,
          lastAppLoginAt: true,
          createdAt: true,
          profile: {
            select: {
              id: true,
              role: true,
              displayName: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      items,
      page,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    })
  } catch (error) {
    const statusCode = (error as { statusCode?: number } | undefined)?.statusCode
    if (statusCode) {
      return NextResponse.json({ error: (error as Error).message }, { status: statusCode })
    }

    return errorResponse(req, error, 'AO LISTAR USUÁRIOS ADMINISTRATIVOS')
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAdminSession()
    const body = await req.json()
    const data = createUserSchema.parse(body)

    if (data.role === 'SUPER' && session.user.role !== 'SUPER') {
      return NextResponse.json({ error: 'Apenas usuários SUPER podem criar novas contas SUPER.' }, { status: 403 })
    }

    const hashedPassword = await bcrypt.hash(data.password, 12)

    const createdUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: hashedPassword,
        profile: {
          create: {
            displayName: data.name,
            role: data.role,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        profile: {
          select: {
            id: true,
            role: true,
            displayName: true,
          },
        },
      },
    })

    return NextResponse.json({ user: createdUser }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 })
    }

    const statusCode = (error as { statusCode?: number } | undefined)?.statusCode
    if (statusCode) {
      return NextResponse.json({ error: (error as Error).message }, { status: statusCode })
    }

    return errorResponse(req, error, 'AO CRIAR USUÁRIO ADMINISTRATIVO')
  }
}
