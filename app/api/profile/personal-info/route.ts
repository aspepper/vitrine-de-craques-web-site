import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { errorResponse, logApiError } from "@/lib/error";

const roleEnum = z.enum(["TORCEDOR", "ATLETA", "RESPONSAVEL", "IMPRENSA", "CLUBE", "AGENTE"]);

const displayNameSchema = z
  .string({ required_error: "Informe um nome" })
  .trim()
  .min(1, "Informe um nome")
  .max(120, "Máximo de 120 caracteres");

const optionalString = z.string().max(400).optional().nullable();
const optionalLongString = z.string().max(1200).optional().nullable();
const optionalUrl = z.string().url().optional().nullable();

const baseSchema = z.object({
  role: roleEnum,
  displayName: displayNameSchema,
  bio: optionalLongString,
});

const torcedorSchema = baseSchema.extend({
  role: z.literal("TORCEDOR"),
  nascimento: optionalString,
  cpf: optionalString,
  genero: optionalString,
  whatsapp: optionalString,
  uf: optionalString,
  cidade: optionalString,
  favoriteClubId: z.string().min(1).optional().nullable(),
  notifNovidades: z.boolean().optional(),
  notifJogos: z.boolean().optional(),
  notifEventos: z.boolean().optional(),
  notifAtletas: z.boolean().optional(),
  lgpdWhatsappNoticias: z.boolean().optional(),
  lgpdWhatsappConvites: z.boolean().optional(),
});

const atletaSchema = baseSchema.extend({
  role: z.literal("ATLETA"),
  cpf: optionalString,
  pais: optionalString,
  uf: optionalString,
  cidade: optionalString,
  posicao: optionalString,
  perna: optionalString,
  altura: optionalString,
  peso: optionalString,
  whatsapp: optionalString,
});

const responsavelSchema = baseSchema.extend({
  role: z.literal("RESPONSAVEL"),
  cpf: optionalString,
  nascimento: optionalString,
  genero: optionalString,
  whatsapp: optionalString,
  responsavelInstagram: optionalString,
  atletaNome: optionalString,
  atletaCpf: optionalString,
  atletaNascimento: optionalString,
  atletaGenero: optionalString,
  atletaEsporte: optionalString,
  atletaModalidade: optionalString,
  atletaObservacoes: optionalLongString,
});

const imprensaSchema = baseSchema.extend({
  role: z.literal("IMPRENSA"),
  cpf: optionalString,
  ddd: optionalString,
  telefone: optionalString,
  uf: optionalString,
  cidade: optionalString,
  site: optionalUrl,
  endereco: optionalString,
  redesSociais: optionalLongString,
  areaAtuacao: optionalLongString,
  portfolio: optionalUrl,
});

const clubeSchema = baseSchema.extend({
  role: z.literal("CLUBE"),
  nomeFantasia: optionalString,
  telefone: optionalString,
  emailClube: optionalString,
  uf: optionalString,
  cidade: optionalString,
  cnpj: optionalString,
  inscricaoEstadual: optionalString,
  representanteNome: optionalString,
  representanteCpf: optionalString,
  representanteEmail: optionalString,
  whatsapp: optionalString,
});

const agenteSchema = baseSchema.extend({
  role: z.literal("AGENTE"),
  cpf: optionalString,
  telefone: optionalString,
  registroCbf: optionalString,
  registroFifa: optionalString,
});

const payloadSchema = z.discriminatedUnion("role", [
  torcedorSchema,
  atletaSchema,
  responsavelSchema,
  imprensaSchema,
  clubeSchema,
  agenteSchema,
]);

function valueOrNull<T>(value: T | null | undefined) {
  return value ?? null;
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const existingProfile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (!existingProfile) {
      return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
    }

    const body = await req.json();
    const payload = payloadSchema.parse(body);

    const updateData: Record<string, unknown> = {
      displayName: payload.displayName.trim(),
      bio: valueOrNull(payload.bio),
    };

    switch (payload.role) {
      case "TORCEDOR": {
        updateData.nascimento = valueOrNull(payload.nascimento);
        updateData.cpf = valueOrNull(payload.cpf);
        updateData.genero = valueOrNull(payload.genero);
        updateData.whatsapp = valueOrNull(payload.whatsapp);
        updateData.uf = valueOrNull(payload.uf);
        updateData.cidade = valueOrNull(payload.cidade);
        updateData.notifNovidades = payload.notifNovidades ?? false;
        updateData.notifJogos = payload.notifJogos ?? false;
        updateData.notifEventos = payload.notifEventos ?? false;
        updateData.notifAtletas = payload.notifAtletas ?? false;
        updateData.lgpdWhatsappNoticias = payload.lgpdWhatsappNoticias ?? false;
        updateData.lgpdWhatsappConvites = payload.lgpdWhatsappConvites ?? false;

        if (payload.favoriteClubId) {
          updateData.favoriteClub = { connect: { id: payload.favoriteClubId } };
        } else {
          updateData.favoriteClub = { disconnect: true };
        }
        break;
      }
      case "ATLETA": {
        updateData.cpf = valueOrNull(payload.cpf);
        updateData.pais = valueOrNull(payload.pais);
        updateData.uf = valueOrNull(payload.uf);
        updateData.cidade = valueOrNull(payload.cidade);
        updateData.posicao = valueOrNull(payload.posicao);
        updateData.perna = valueOrNull(payload.perna);
        updateData.altura = valueOrNull(payload.altura);
        updateData.peso = valueOrNull(payload.peso);
        updateData.whatsapp = valueOrNull(payload.whatsapp);
        break;
      }
      case "RESPONSAVEL": {
        updateData.cpf = valueOrNull(payload.cpf);
        updateData.nascimento = valueOrNull(payload.nascimento);
        updateData.genero = valueOrNull(payload.genero);
        updateData.whatsapp = valueOrNull(payload.whatsapp);
        updateData.responsavelInstagram = valueOrNull(payload.responsavelInstagram);
        updateData.atletaNome = valueOrNull(payload.atletaNome);
        updateData.atletaCpf = valueOrNull(payload.atletaCpf);
        updateData.atletaNascimento = valueOrNull(payload.atletaNascimento);
        updateData.atletaGenero = valueOrNull(payload.atletaGenero);
        updateData.atletaEsporte = valueOrNull(payload.atletaEsporte);
        updateData.atletaModalidade = valueOrNull(payload.atletaModalidade);
        updateData.atletaObservacoes = valueOrNull(payload.atletaObservacoes);
        break;
      }
      case "IMPRENSA": {
        updateData.cpf = valueOrNull(payload.cpf);
        updateData.ddd = valueOrNull(payload.ddd);
        updateData.telefone = valueOrNull(payload.telefone);
        updateData.uf = valueOrNull(payload.uf);
        updateData.cidade = valueOrNull(payload.cidade);
        updateData.site = valueOrNull(payload.site);
        updateData.endereco = valueOrNull(payload.endereco);
        updateData.redesSociais = valueOrNull(payload.redesSociais);
        updateData.areaAtuacao = valueOrNull(payload.areaAtuacao);
        updateData.portfolio = valueOrNull(payload.portfolio);
        break;
      }
      case "CLUBE": {
        updateData.nomeFantasia = valueOrNull(payload.nomeFantasia);
        updateData.telefone = valueOrNull(payload.telefone);
        updateData.emailClube = valueOrNull(payload.emailClube);
        updateData.uf = valueOrNull(payload.uf);
        updateData.cidade = valueOrNull(payload.cidade);
        updateData.cnpj = valueOrNull(payload.cnpj);
        updateData.inscricaoEstadual = valueOrNull(payload.inscricaoEstadual);
        updateData.representanteNome = valueOrNull(payload.representanteNome);
        updateData.representanteCpf = valueOrNull(payload.representanteCpf);
        updateData.representanteEmail = valueOrNull(payload.representanteEmail);
        updateData.whatsapp = valueOrNull(payload.whatsapp);
        break;
      }
      case "AGENTE": {
        updateData.cpf = valueOrNull(payload.cpf);
        updateData.telefone = valueOrNull(payload.telefone);
        updateData.registroCbf = valueOrNull(payload.registroCbf);
        updateData.registroFifa = valueOrNull(payload.registroFifa);
        break;
      }
      default:
        break;
    }

    await prisma.profile.update({
      where: { userId: session.user.id },
      data: updateData,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const { errorId } = await logApiError(req, error, "AO ATUALIZAR DADOS PESSOAIS");
      return NextResponse.json({ error: "Dados inválidos", errorId }, { status: 400 });
    }

    return errorResponse(req, error, "AO ATUALIZAR DADOS PESSOAIS");
  }
}
