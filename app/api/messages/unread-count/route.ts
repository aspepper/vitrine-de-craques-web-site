import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { logError } from "@/lib/error";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ count: 0 }, { status: 200 });
  }

  try {
    const count = await prisma.message.count({
      where: {
        recipientId: userId,
        readAt: null,
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    await logError(error, "MENSAGENS_BUSCAR_NAO_LIDAS", { userId, url: request.url });
    return NextResponse.json({ count: 0 }, { status: 200 });
  }
}

