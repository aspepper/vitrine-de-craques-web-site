ALTER TABLE "public"."Confederation"
    ADD COLUMN "logoUrl" TEXT,
    ADD COLUMN "foundedAt" TIMESTAMP(3),
    ADD COLUMN "purpose" TEXT,
    ADD COLUMN "currentPresident" TEXT,
    ADD COLUMN "officialStatement" TEXT,
    ADD COLUMN "officialStatementDate" TIMESTAMP(3),
    ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
