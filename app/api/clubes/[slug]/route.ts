import { NextResponse } from "next/server";
import prisma from "@/lib/db";

interface Params {
  params: { slug: string };
}

export async function GET(_req: Request, { params }: Params) {
  const club = await prisma.club.findUnique({
    where: { slug: params.slug },
    include: { confederation: true },
  });
  if (!club) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  return NextResponse.json(club);
}
