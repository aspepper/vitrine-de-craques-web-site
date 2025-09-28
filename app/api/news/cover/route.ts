import { randomUUID } from "node:crypto"

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { errorResponse } from "@/lib/error"
import { deleteFileByUrl, uploadFile } from "@/lib/storage"

const MAX_FILE_SIZE = 10 * 1024 * 1024
const MIN_WIDTH = 1600
const MIN_HEIGHT = 895

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function isFileLike(value: FormDataEntryValue | null): value is File {
  if (!value || typeof value === "string") {
    return false
  }

  const file = value as File

  return (
    typeof file.arrayBuffer === "function" &&
    typeof file.size === "number" &&
    typeof file.type === "string" &&
    typeof file.name === "string"
  )
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { role: true },
    })

    if (!profile || profile.role !== "IMPRENSA") {
      return NextResponse.json(
        { error: "Apenas jornalistas e blogueiros podem enviar imagens de capa." },
        { status: 403 },
      )
    }

    const formData = await req.formData()
    const file = formData.get("cover")
    const previousUrl = formData.get("previousUrl")

    if (!isFileLike(file)) {
      return NextResponse.json({ error: "Selecione uma imagem para enviar." }, { status: 400 })
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Envie um arquivo de imagem válido." }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Envie imagens de até 10MB." }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let optimizedBuffer: Buffer<ArrayBufferLike> | null = null
    let contentType = file.type || "application/octet-stream"
    let extension = file.name.split(".").pop() ?? "bin"

    try {
      const sharpModule = await import("sharp")
      const sharpInstance = sharpModule.default(buffer)
      const metadata = await sharpInstance.metadata()

      if (!metadata.width || !metadata.height) {
        return NextResponse.json(
          { error: "Não foi possível processar a imagem enviada." },
          { status: 400 },
        )
      }

      if (metadata.width < MIN_WIDTH || metadata.height < MIN_HEIGHT) {
        return NextResponse.json(
          {
            error: `Envie uma imagem com pelo menos ${MIN_WIDTH}x${MIN_HEIGHT} pixels.`,
          },
          { status: 400 },
        )
      }

      let pipeline = sharpModule.default(buffer)

      if (metadata.width > MIN_WIDTH || metadata.height > MIN_HEIGHT) {
        pipeline = pipeline.resize(MIN_WIDTH, MIN_HEIGHT, {
          fit: "cover",
          position: "centre",
        })
      }

      optimizedBuffer = await pipeline.webp({ quality: 90 }).toBuffer()
      contentType = "image/webp"
      extension = "webp"
    } catch (error) {
      console.error("Erro ao otimizar imagem de capa", error)
      return NextResponse.json(
        { error: "Não foi possível processar a imagem enviada." },
        { status: 500 },
      )
    }

    if (!optimizedBuffer) {
      return NextResponse.json(
        { error: "Não foi possível processar a imagem enviada." },
        { status: 500 },
      )
    }

    const filename = `${session.user.id}-${randomUUID()}.${extension}`
    const key = `uploads/news-covers/${session.user.id}/${filename}`

    const { url } = await uploadFile({
      key,
      data: optimizedBuffer,
      contentType,
      cacheControl: "public, max-age=31536000, immutable",
    })

    if (typeof previousUrl === "string" && previousUrl.trim().length > 0) {
      await deleteFileByUrl(previousUrl)
    }

    return NextResponse.json({ url })
  } catch (error) {
    return errorResponse(req, error, "AO ENVIAR IMAGEM DE CAPA")
  }
}
