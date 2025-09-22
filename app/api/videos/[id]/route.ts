import { NextResponse } from "next/server"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { errorResponse, logApiError } from "@/lib/error"
import { deleteFileByUrl } from "@/lib/storage"

const updateVideoSchema = z
  .object({
    title: z.string().min(1).max(160).optional(),
    description: z.string().max(600).optional(),
  })
  .refine((value) => Object.values(value).some((field) => field !== undefined), {
    message: "Informe ao menos um campo para atualizar",
  })

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
      deleteFileByUrl(video.videoUrl),
      deleteFileByUrl(video.thumbnailUrl),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    return errorResponse(req, error, "AO REMOVER VÍDEO")
  }
}
