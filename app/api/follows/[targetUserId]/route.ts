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

async function buildFollowResponse(targetUserId: string, viewerId?: string) {
  const [followersCount, existing] = await Promise.all([
    prisma.follow.count({ where: { followingId: targetUserId } }),
    viewerId
      ? prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: viewerId,
              followingId: targetUserId,
            },
          },
          select: { id: true },
        })
      : Promise.resolve(null),
  ]);

  return {
    followerCount: followersCount,
    isFollowing: Boolean(existing),
  };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const targetUserId = params.targetUserId;

    if (!targetUserId) {
      return NextResponse.json({ message: "Missing target user" }, { status: 400 });
    }

    const exists = await ensureUserExists(targetUserId);
    if (!exists) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const payload = await buildFollowResponse(targetUserId, session?.user?.id);
    return NextResponse.json(payload);
  } catch (error) {
    return errorResponse(req, error, "AO VERIFICAR SEGUIDORES");
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const targetUserId = params.targetUserId;
    if (!targetUserId) {
      return NextResponse.json({ message: "Missing target user" }, { status: 400 });
    }

    const viewerId = session.user.id;
    if (viewerId === targetUserId) {
      return NextResponse.json({ message: "Não é possível seguir a si mesmo." }, { status: 400 });
    }

    const exists = await ensureUserExists(targetUserId);
    if (!exists) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    await prisma.follow.upsert({
      where: {
        followerId_followingId: {
          followerId: viewerId,
          followingId: targetUserId,
        },
      },
      update: {},
      create: {
        followerId: viewerId,
        followingId: targetUserId,
      },
    });

    const payload = await buildFollowResponse(targetUserId, viewerId);
    return NextResponse.json(payload, { status: 201 });
  } catch (error) {
    return errorResponse(req, error, "AO CRIAR SEGUIDOR");
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const targetUserId = params.targetUserId;
    if (!targetUserId) {
      return NextResponse.json({ message: "Missing target user" }, { status: 400 });
    }

    const viewerId = session.user.id;

    await prisma.follow.deleteMany({
      where: {
        followerId: viewerId,
        followingId: targetUserId,
      },
    });

    const payload = await buildFollowResponse(targetUserId, viewerId);
    return NextResponse.json(payload);
  } catch (error) {
    return errorResponse(req, error, "AO REMOVER SEGUIDOR");
  }
}
