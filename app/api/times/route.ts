import { NextResponse } from "next/server"

import prisma from "@/lib/db"
import { errorResponse } from "@/lib/error"

export async function GET(req: Request) {
  try {
    const times = await prisma.times.findMany({
      orderBy: { clube: "asc" },
      select: {
        id: true,
        clube: true,
        sigla: true,
        estado: true,
        cidade: true,
        divisao: true,
      },
    })

    return NextResponse.json({ items: times })
  } catch (error) {
    return errorResponse(req, error, "AO LISTAR TIMES")
  }
}
