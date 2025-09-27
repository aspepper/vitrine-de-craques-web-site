import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { logError } from "@/lib/error";

interface MessagePayload {
  recipientId?: unknown;
  content?: unknown;
}

function validatePayload(payload: MessagePayload) {
  const errors: string[] = [];

  const recipientId = typeof payload.recipientId === "string" ? payload.recipientId.trim() : "";
  if (!recipientId) {
    errors.push("Destinatário inválido.");
  }

  const content = typeof payload.content === "string" ? payload.content.trim() : "";
  if (!content) {
    errors.push("Escreva uma mensagem antes de enviar.");
  }

  if (content.length > 1000) {
    errors.push("A mensagem deve ter no máximo 1000 caracteres.");
  }

  return {
    isValid: errors.length === 0,
    recipientId,
    content,
    errors,
  };
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const senderId = session?.user?.id;

  if (!senderId) {
    return NextResponse.json({ message: "É necessário estar autenticado para enviar mensagens." }, { status: 401 });
  }

  let payload: MessagePayload;
  try {
    payload = (await request.json()) as MessagePayload;
  } catch (error) {
    await logError(error, "MENSAGENS_ENVIAR_JSON_INVALIDO");
    return NextResponse.json({ message: "Não foi possível ler o conteúdo enviado." }, { status: 400 });
  }

  const { isValid, recipientId, content, errors } = validatePayload(payload);
  if (!isValid || !recipientId) {
    return NextResponse.json({ message: errors.join(" ") || "Dados inválidos." }, { status: 400 });
  }

  if (recipientId === senderId) {
    return NextResponse.json({ message: "Você não pode enviar mensagens para si mesmo." }, { status: 400 });
  }

  try {
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: { id: true },
    });

    if (!recipient) {
      return NextResponse.json({ message: "Perfil de destino não encontrado." }, { status: 404 });
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        recipientId,
        content,
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "Mensagem enviada com sucesso.",
        data: message,
      },
      { status: 201 },
    );
  } catch (error) {
    await logError(error, "MENSAGENS_ENVIAR_FALHA", { senderId, recipientId });
    return NextResponse.json(
      { message: "Não foi possível enviar a mensagem neste momento." },
      { status: 500 },
    );
  }
}

