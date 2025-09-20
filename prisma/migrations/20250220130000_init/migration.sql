-- Baseline migration generated for existing production schema.
-- The statements are written to be idempotent so they can be applied safely
-- on the provisioned Neon PostgreSQL database without recreating existing data.

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'Role'
      AND n.nspname = 'public'
  ) THEN
    CREATE TYPE "public"."Role" AS ENUM ('ATLETA', 'AGENTE', 'CLUBE', 'TORCEDOR', 'IMPRENSA', 'RESPONSAVEL');
  END IF;
END
$$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "public"."Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "passwordHash" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."Profile" (
    "id" TEXT NOT NULL,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "role" "public"."Role" NOT NULL,
    "data" JSONB,
    "cpf" TEXT,
    "rg" TEXT,
    "cep" TEXT,
    "nascimento" TEXT,
    "genero" TEXT,
    "telefone" TEXT,
    "ddd" TEXT,
    "site" TEXT,
    "endereco" TEXT,
    "redesSociais" TEXT,
    "areaAtuacao" TEXT,
    "portfolio" TEXT,
    "posicao" TEXT,
    "perna" TEXT,
    "altura" TEXT,
    "peso" TEXT,
    "pais" TEXT,
    "uf" TEXT,
    "clube" TEXT,
    "nomeFantasia" TEXT,
    "emailClube" TEXT,
    "cidade" TEXT,
    "cnpj" TEXT,
    "inscricaoEstadual" TEXT,
    "representanteNome" TEXT,
    "representanteCpf" TEXT,
    "representanteEmail" TEXT,
    "whatsapp" TEXT,
    "registroCbf" TEXT,
    "registroFifa" TEXT,
    "responsavelNascimento" TEXT,
    "responsavelGenero" TEXT,
    "responsavelInstagram" TEXT,
    "atletaNome" TEXT,
    "atletaCpf" TEXT,
    "atletaNascimento" TEXT,
    "atletaGenero" TEXT,
    "atletaEsporte" TEXT,
    "atletaModalidade" TEXT,
    "atletaObservacoes" TEXT,
    "notifNovidades" BOOLEAN DEFAULT false,
    "notifJogos" BOOLEAN DEFAULT false,
    "notifEventos" BOOLEAN DEFAULT false,
    "notifAtletas" BOOLEAN DEFAULT false,
    "termos" BOOLEAN DEFAULT false,
    "lgpdWhatsappNoticias" BOOLEAN DEFAULT false,
    "lgpdWhatsappConvites" BOOLEAN DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."Video" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "videoUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."Confederation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    CONSTRAINT "Confederation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."Club" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "confederationId" TEXT,
    CONSTRAINT "Club_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."News" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT,
    "category" TEXT,
    "coverImage" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT,
    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."Game" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "homeClubId" TEXT NOT NULL,
    "awayClubId" TEXT NOT NULL,
    "scoreHome" INTEGER,
    "scoreAway" INTEGER,
    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."Times" (
    "id" TEXT NOT NULL,
    "divisao" TEXT NOT NULL,
    "clube" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sigla" TEXT NOT NULL,
    "apelido" TEXT NOT NULL,
    "mascote" TEXT NOT NULL,
    "fundacao" INTEGER,
    "maiorIdolo" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    CONSTRAINT "Times_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "public"."Account"("provider", "providerAccountId");
CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key" ON "public"."Session"("sessionToken");
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "public"."User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_token_key" ON "public"."VerificationToken"("token");
CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_identifier_token_key" ON "public"."VerificationToken"("identifier", "token");
CREATE UNIQUE INDEX IF NOT EXISTS "Profile_userId_key" ON "public"."Profile"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "Confederation_slug_key" ON "public"."Confederation"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "Club_name_key" ON "public"."Club"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "Club_slug_key" ON "public"."Club"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "News_slug_key" ON "public"."News"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "Game_slug_key" ON "public"."Game"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "Times_slug_key" ON "public"."Times"("slug");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Account_userId_fkey'
  ) THEN
    ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Session_userId_fkey'
  ) THEN
    ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Profile_userId_fkey'
  ) THEN
    ALTER TABLE "public"."Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Video_userId_fkey'
  ) THEN
    ALTER TABLE "public"."Video" ADD CONSTRAINT "Video_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Club_confederationId_fkey'
  ) THEN
    ALTER TABLE "public"."Club" ADD CONSTRAINT "Club_confederationId_fkey" FOREIGN KEY ("confederationId") REFERENCES "public"."Confederation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'News_authorId_fkey'
  ) THEN
    ALTER TABLE "public"."News" ADD CONSTRAINT "News_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Game_homeClubId_fkey'
  ) THEN
    ALTER TABLE "public"."Game" ADD CONSTRAINT "Game_homeClubId_fkey" FOREIGN KEY ("homeClubId") REFERENCES "public"."Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Game_awayClubId_fkey'
  ) THEN
    ALTER TABLE "public"."Game" ADD CONSTRAINT "Game_awayClubId_fkey" FOREIGN KEY ("awayClubId") REFERENCES "public"."Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END
$$;
