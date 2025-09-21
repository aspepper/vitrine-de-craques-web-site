import { NextResponse } from "next/server"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { promises as fs } from "fs"
import path from "path"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { errorResponse, logApiError } from "@/lib/error"

const updateVideoSchema = z
  .object({
    title: z.string().min(1).max(160).optional(),
    description: z.string().max(600).optional(),
  })
  .refine((value) => Object.values(value).some((field) => field !== undefined), {
    message: "Informe ao menos um campo para atualizar",
  })

function resolveUploadPath(url?: string | null) {
  if (!url || !url.startsWith("/uploads/")) return null
  return path.join(process.cwd(), "public", url)
}

async function removeFileIfExists(filePath: string | null) {
  if (!filePath) return
  try {
    await fs.unlink(filePath)
  } catch (error) {
    const err = error as NodeJS.ErrnoException
    if (err.code !== "ENOENT") {
      console.error("Erro ao remover arquivo", filePath, error)
    }
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const video = await prisma.video.findUnique({ where: { id: params.id } })
    if (!video) {
      return NextResponse.json({ error: "Vídeo não encontrado" }, { status: 404 })
    }

    if (video.userId !== session.user.id) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const body = await req.json()
    const payload = updateVideoSchema.parse(body)

    const updated = await prisma.video.update({
      where: { id: params.id },
      data: {
        ...(payload.title ? { title: payload.title } : {}),
        ...(payload.description !== undefined
          ? { description: payload.description ?? null }
          : {}),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const { errorId } = await logApiError(req, error, "AO ATUALIZAR VÍDEO")
      return NextResponse.json({ error: error.flatten(), errorId }, { status: 400 })
    }

    return errorResponse(req, error, "AO ATUALIZAR VÍDEO")
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const video = await prisma.video.findUnique({ where: { id: params.id } })
    if (!video) {
      return NextResponse.json({ error: "Vídeo não encontrado" }, { status: 404 })
    }

    if (video.userId !== session.user.id) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    await prisma.video.delete({ where: { id: params.id } })

    await Promise.all([
      removeFileIfExists(resolveUploadPath(video.videoUrl)),
      removeFileIfExists(resolveUploadPath(video.thumbnailUrl)),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    return errorResponse(req, error, "AO REMOVER VÍDEO")
  }
}
