import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { errorResponse } from "@/lib/error";

interface RouteParams {
  params: { targetUserId: string };
}

async function ensureUserExists(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const blockerId = session.user.id;
    const targetUserId = params.targetUserId;

    if (!targetUserId) {
      return NextResponse.json({ message: "Missing target user" }, { status: 400 });
    }

    if (blockerId === targetUserId) {
      return NextResponse.json({ message: "Não é possível bloquear a si mesmo." }, { status: 400 });
    }

    const exists = await ensureUserExists(targetUserId);
    if (!exists) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.follow.deleteMany({
        where: {
          OR: [
            { followerId: blockerId, followingId: targetUserId },
            { followerId: targetUserId, followingId: blockerId },
          ],
        },
      }),
      prisma.block.upsert({
        where: {
          blockerId_blockedId: {
            blockerId,
            blockedId: targetUserId,
          },
        },
        update: {},
        create: {
          blockerId,
          blockedId: targetUserId,
        },
      }),
    ]);

    return NextResponse.json({ blocked: true });
  } catch (error) {
    return errorResponse(req, error, "AO BLOQUEAR USUÁRIO");
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const blockerId = session.user.id;
    const targetUserId = params.targetUserId;

    if (!targetUserId) {
      return NextResponse.json({ message: "Missing target user" }, { status: 400 });
    }

    await prisma.block.deleteMany({
      where: {
        blockerId,
        blockedId: targetUserId,
      },
    });

    return NextResponse.json({ blocked: false });
  } catch (error) {
    return errorResponse(req, error, "AO DESBLOQUEAR USUÁRIO");
  }
}
