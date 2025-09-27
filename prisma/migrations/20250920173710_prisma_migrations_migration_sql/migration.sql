DO $$
BEGIN
    -- Create Enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN
        CREATE TYPE "public"."Role" AS ENUM ('ATLETA', 'AGENTE', 'CLUBE', 'TORCEDOR', 'IMPRENSA', 'RESPONSAVEL');
    END IF;

    -- Create Tables
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Account') THEN
        CREATE TABLE "public"."Account" (
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
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Session') THEN
        CREATE TABLE "public"."Session" (
            "id" TEXT NOT NULL,
            "sessionToken" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "expires" TIMESTAMP(3) NOT NULL,

            CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Session') THEN
        CREATE TABLE "public"."Session" (
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
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'VerificationToken') THEN
        CREATE TABLE "public"."VerificationToken" (
            "identifier" TEXT NOT NULL,
            "token" TEXT NOT NULL,
            "expires" TIMESTAMP(3) NOT NULL
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Profile') THEN
        CREATE TABLE "public"."Profile" (
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
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Video') THEN
        CREATE TABLE "public"."Video" (
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
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Confederation') THEN
        CREATE TABLE "public"."Confederation" (
            "id" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "slug" TEXT NOT NULL,
            "logoUrl" TEXT,
            "foundedAt" TIMESTAMP(3),
            "purpose" TEXT,
            "currentPresident" TEXT,
            "officialStatement" TEXT,
            "officialStatementDate" TIMESTAMP(3),
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

            CONSTRAINT "Confederation_pkey" PRIMARY KEY ("id")
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Confederation') THEN
    CREATE TABLE "public"."Club" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "confederationId" TEXT,

        CONSTRAINT "Club_pkey" PRIMARY KEY ("id")
    );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Confederation') THEN
    CREATE TABLE "public"."News" (
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
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Confederation') THEN
    CREATE TABLE "public"."Game" (
        "id" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "title" TEXT,
        "category" TEXT,
        "excerpt" TEXT,
        "content" TEXT,
        "coverImage" TEXT,
        "authorId" TEXT,
        "date" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
    );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Confederation') THEN
    CREATE TABLE "public"."Times" (
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
    END IF;

    -- CreateIndexes
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Account_provider_providerAccountId_key') THEN
        CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "public"."Account"("provider", "providerAccountId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Session_sessionToken_key') THEN
        CREATE UNIQUE INDEX "Session_sessionToken_key" ON "public"."Session"("sessionToken");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'User_email_key') THEN
        CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'VerificationToken_token_key') THEN
        CREATE UNIQUE INDEX "VerificationToken_token_key" ON "public"."VerificationToken"("token");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'VerificationToken_identifier_token_key') THEN
        CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "public"."VerificationToken"("identifier", "token");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Profile_userId_key') THEN
        CREATE UNIQUE INDEX "Profile_userId_key" ON "public"."Profile"("userId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Confederation_slug_key') THEN
        CREATE UNIQUE INDEX "Confederation_slug_key" ON "public"."Confederation"("slug");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Club_name_key') THEN
        CREATE UNIQUE INDEX "Club_name_key" ON "public"."Club"("name");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Club_slug_key') THEN
        CREATE UNIQUE INDEX "Club_slug_key" ON "public"."Club"("slug");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'News_slug_key') THEN
        CREATE UNIQUE INDEX "News_slug_key" ON "public"."News"("slug");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Game_slug_key') THEN
        CREATE UNIQUE INDEX "Game_slug_key" ON "public"."Game"("slug");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Times_slug_key') THEN
        CREATE UNIQUE INDEX "Times_slug_key" ON "public"."Times"("slug");
    END IF;

    -- Create Foreign Keys
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Account_userId_fkey') THEN
        ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Session_userId_fkey') THEN
        ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Profile_userId_fkey') THEN
        ALTER TABLE "public"."Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Video_userId_fkey') THEN
        ALTER TABLE "public"."Video" ADD CONSTRAINT "Video_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Club_confederationId_fkey') THEN
        ALTER TABLE "public"."Club" ADD CONSTRAINT "Club_confederationId_fkey" FOREIGN KEY ("confederationId") REFERENCES "public"."Confederation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AccounNews_authorId_fkeyt_userId_fkey') THEN
        ALTER TABLE "public"."News" ADD CONSTRAINT "News_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Game_authorId_fkey') THEN
        ALTER TABLE "public"."Game" ADD CONSTRAINT "Game_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END$$;

