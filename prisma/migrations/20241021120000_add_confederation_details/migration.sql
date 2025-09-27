DO $$
DECLARE
  confederation_exists BOOLEAN;
  column_exists BOOLEAN;
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

  -- Add optional columns only when they do not exist to keep the migration idempotent
  PERFORM 1
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'Confederation'
    AND column_name = 'logoUrl';
  IF NOT FOUND THEN
    EXECUTE 'ALTER TABLE "public"."Confederation" ADD COLUMN "logoUrl" TEXT';
  END IF;

  PERFORM 1
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'Confederation'
    AND column_name = 'foundedAt';
  IF NOT FOUND THEN
    EXECUTE 'ALTER TABLE "public"."Confederation" ADD COLUMN "foundedAt" TIMESTAMP(3)';
  END IF;

  PERFORM 1
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'Confederation'
    AND column_name = 'purpose';
  IF NOT FOUND THEN
    EXECUTE 'ALTER TABLE "public"."Confederation" ADD COLUMN "purpose" TEXT';
  END IF;

  PERFORM 1
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'Confederation'
    AND column_name = 'currentPresident';
  IF NOT FOUND THEN
    EXECUTE 'ALTER TABLE "public"."Confederation" ADD COLUMN "currentPresident" TEXT';
  END IF;

  PERFORM 1
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'Confederation'
    AND column_name = 'officialStatement';
  IF NOT FOUND THEN
    EXECUTE 'ALTER TABLE "public"."Confederation" ADD COLUMN "officialStatement" TEXT';
  END IF;

  PERFORM 1
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'Confederation'
    AND column_name = 'officialStatementDate';
  IF NOT FOUND THEN
    EXECUTE 'ALTER TABLE "public"."Confederation" ADD COLUMN "officialStatementDate" TIMESTAMP(3)';
  END IF;

  PERFORM 1
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'Confederation'
    AND column_name = 'createdAt';
  IF NOT FOUND THEN
    EXECUTE 'ALTER TABLE "public"."Confederation" ADD COLUMN "createdAt" TIMESTAMP(3)';
  END IF;

  PERFORM 1
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'Confederation'
    AND column_name = 'updatedAt';
  IF NOT FOUND THEN
    EXECUTE 'ALTER TABLE "public"."Confederation" ADD COLUMN "updatedAt" TIMESTAMP(3)';
  END IF;

  -- Ensure createdAt has defaults and no null values before adding the NOT NULL constraint
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Confederation'
      AND column_name = 'createdAt'
  )
  INTO column_exists;

  IF column_exists THEN
    EXECUTE 'UPDATE "public"."Confederation"
      SET "createdAt" = COALESCE("createdAt", CURRENT_TIMESTAMP)
      WHERE "createdAt" IS NULL';

    EXECUTE 'ALTER TABLE "public"."Confederation"
      ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP';

    -- Guard against unexpected null values that could have been introduced manually
    EXECUTE 'UPDATE "public"."Confederation"
      SET "createdAt" = CURRENT_TIMESTAMP
      WHERE "createdAt" IS NULL';

    EXECUTE 'ALTER TABLE "public"."Confederation"
      ALTER COLUMN "createdAt" SET NOT NULL';
  END IF;

  -- Ensure updatedAt has defaults and no null values before adding the NOT NULL constraint
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Confederation'
      AND column_name = 'updatedAt'
  )
  INTO column_exists;

  IF column_exists THEN
    EXECUTE 'UPDATE "public"."Confederation"
      SET "updatedAt" = COALESCE("updatedAt", CURRENT_TIMESTAMP)
      WHERE "updatedAt" IS NULL';

    EXECUTE 'ALTER TABLE "public"."Confederation"
      ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP';

    EXECUTE 'UPDATE "public"."Confederation"
      SET "updatedAt" = CURRENT_TIMESTAMP
      WHERE "updatedAt" IS NULL';

    EXECUTE 'ALTER TABLE "public"."Confederation"
      ALTER COLUMN "updatedAt" SET NOT NULL';
  END IF;
END;
$$ LANGUAGE plpgsql;
