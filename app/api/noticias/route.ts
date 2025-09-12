import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  const [items, total] = await prisma.$transaction([
    prisma.news.findMany({
      skip,
      take: limit,
      orderBy: { publishedAt: "desc" },
    }),
    prisma.news.count(),
  ]);

  return NextResponse.json({
    items,
    page,
    total,
    totalPages: Math.ceil(total / limit),
  });
}
