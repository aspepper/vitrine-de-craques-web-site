import { NextResponse } from "next/server";
import prisma from "@/lib/db";

interface Params {
  params: { id: string };
}

export async function GET(_req: Request, { params }: Params) {
  const profile = await prisma.profile.findUnique({ where: { id: params.id } });
  if (!profile || profile.role !== "ATLETA") {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  return NextResponse.json(profile);
}
