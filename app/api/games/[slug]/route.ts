import { NextResponse } from "next/server";
import prisma from "@/lib/db";

interface Params {
  params: { slug: string };
}

export async function GET(_req: Request, { params }: Params) {
  const game = await prisma.game.findUnique({
    where: { slug: params.slug },
    include: { homeClub: true, awayClub: true },
  });
  if (!game) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  return NextResponse.json(game);
}
