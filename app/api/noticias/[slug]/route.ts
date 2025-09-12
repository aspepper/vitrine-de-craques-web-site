import { NextResponse } from "next/server";
import prisma from "@/lib/db";

interface Params {
  params: { slug: string };
}

export async function GET(_req: Request, { params }: Params) {
  const news = await prisma.news.findUnique({
    where: { slug: params.slug },
  });
  if (!news) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  return NextResponse.json(news);
}
