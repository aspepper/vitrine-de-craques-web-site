import { NextResponse } from "next/server";
import prisma from "@/lib/db";

interface Params {
  params: { slug: string };
}

export async function GET(_req: Request, { params }: Params) {
  const confed = await prisma.confederation.findUnique({
    where: { slug: params.slug },
    include: { clubs: true },
  });
  if (!confed) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  return NextResponse.json(confed);
}
