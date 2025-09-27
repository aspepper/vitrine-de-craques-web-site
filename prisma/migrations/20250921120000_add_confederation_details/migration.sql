DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'Confederation'
  ) THEN
    -- Optional metadata fields ---------------------------------------------
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'Confederation'
        AND column_name = 'logoUrl'
    ) THEN
      ALTER TABLE "public"."Confederation"
        ADD COLUMN "logoUrl" TEXT;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'Confederation'
        AND column_name = 'foundedAt'
    ) THEN
      ALTER TABLE "public"."Confederation"
        ADD COLUMN "foundedAt" TIMESTAMP(3);
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'Confederation'
        AND column_name = 'purpose'
    ) THEN
      ALTER TABLE "public"."Confederation"
        ADD COLUMN "purpose" TEXT;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'Confederation'
        AND column_name = 'currentPresident'
    ) THEN
      ALTER TABLE "public"."Confederation"
        ADD COLUMN "currentPresident" TEXT;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'Confederation'
        AND column_name = 'officialStatement'
    ) THEN
      ALTER TABLE "public"."Confederation"
        ADD COLUMN "officialStatement" TEXT;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'Confederation'
        AND column_name = 'officialStatementDate'
    ) THEN
      ALTER TABLE "public"."Confederation"
        ADD COLUMN "officialStatementDate" TIMESTAMP(3);
    END IF;

    -- Timestamp fields ------------------------------------------------------
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'Confederation'
        AND column_name = 'createdAt'
    ) THEN
      ALTER TABLE "public"."Confederation"
        ADD COLUMN "createdAt" TIMESTAMP(3);
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'Confederation'
        AND column_name = 'updatedAt'
    ) THEN
      ALTER TABLE "public"."Confederation"
        ADD COLUMN "updatedAt" TIMESTAMP(3);
    END IF;

    -- Ensure sensible defaults and constraints -----------------------------
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'Confederation'
        AND column_name = 'createdAt'
    ) THEN
      ALTER TABLE "public"."Confederation"
        ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

      UPDATE "public"."Confederation"
        SET "createdAt" = COALESCE("createdAt", CURRENT_TIMESTAMP)
        WHERE "createdAt" IS NULL;

      ALTER TABLE "public"."Confederation"
        ALTER COLUMN "createdAt" SET NOT NULL;
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'Confederation'
        AND column_name = 'updatedAt'
    ) THEN
      ALTER TABLE "public"."Confederation"
        ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

      UPDATE "public"."Confederation"
        SET "updatedAt" = COALESCE("updatedAt", CURRENT_TIMESTAMP)
        WHERE "updatedAt" IS NULL;

      ALTER TABLE "public"."Confederation"
        ALTER COLUMN "updatedAt" SET NOT NULL;
    END IF;
  ELSE
    RAISE NOTICE 'Skipping confederation detail migration because the table does not exist.';
  END IF;
END;
$$;
