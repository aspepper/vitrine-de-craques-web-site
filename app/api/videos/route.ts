import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  const videos = await prisma.video.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(videos);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const data = await req.formData();
  const videoFile = data.get("video") as File | null;
  const thumbFile = data.get("thumbnail") as File | null;
  const title = data.get("title") as string;
  const description = data.get("description") as string | undefined;

  if (!videoFile || !title) {
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  const videoBytes = Buffer.from(await videoFile.arrayBuffer());
  const videoName = `${crypto.randomUUID()}-${videoFile.name}`;
  await fs.writeFile(path.join(uploadsDir, videoName), videoBytes);

  let thumbnailUrl: string | undefined;
  if (thumbFile) {
    const thumbBytes = Buffer.from(await thumbFile.arrayBuffer());
    const thumbName = `${crypto.randomUUID()}-${thumbFile.name}`;
    await fs.writeFile(path.join(uploadsDir, thumbName), thumbBytes);
    thumbnailUrl = `/uploads/${thumbName}`;
  }

  const video = await prisma.video.create({
    data: {
      title,
      description,
      videoUrl: `/uploads/${videoName}`,
      thumbnailUrl,
      userId: session.user.id,
    },
  });

  return NextResponse.json(video);
}
