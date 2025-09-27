DO $$
DECLARE
  confederation_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'Confederation'
  )
  INTO confederation_exists;

  IF NOT confederation_exists THEN
    RAISE NOTICE 'Skipping confederation detail migration because the table does not exist.';
    RETURN;
  END IF;

  EXECUTE 'ALTER TABLE "public"."Confederation"
    ADD COLUMN IF NOT EXISTS "logoUrl" TEXT,
    ADD COLUMN IF NOT EXISTS "foundedAt" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "purpose" TEXT,
    ADD COLUMN IF NOT EXISTS "currentPresident" TEXT,
    ADD COLUMN IF NOT EXISTS "officialStatement" TEXT,
    ADD COLUMN IF NOT EXISTS "officialStatementDate" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3)';

  EXECUTE 'ALTER TABLE "public"."Confederation"
    ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP,
    ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP';

  EXECUTE 'UPDATE "public"."Confederation"
    SET "createdAt" = COALESCE("createdAt", CURRENT_TIMESTAMP)
    WHERE "createdAt" IS NULL';

  EXECUTE 'UPDATE "public"."Confederation"
    SET "updatedAt" = COALESCE("updatedAt", CURRENT_TIMESTAMP)
    WHERE "updatedAt" IS NULL';

  EXECUTE 'ALTER TABLE "public"."Confederation"
    ALTER COLUMN "createdAt" SET NOT NULL';

  EXECUTE 'ALTER TABLE "public"."Confederation"
    ALTER COLUMN "updatedAt" SET NOT NULL';
END;
$$;
