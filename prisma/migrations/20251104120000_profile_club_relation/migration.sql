-- Likes em Video/News: só cria a coluna se não existir
ALTER TABLE "Video"
  ADD COLUMN IF NOT EXISTS "likesCount" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "News"
  ADD COLUMN IF NOT EXISTS "likesCount" INTEGER NOT NULL DEFAULT 0;

-- Migração do Profile.clube -> FK Times(id): aplicar apenas se ainda não houver a FK
DO $$
DECLARE
  has_fk        boolean;
  has_clube     boolean;
  has_clube_new boolean;
BEGIN
  -- Se a constraint já existe, nada a fazer
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Profile_clube_fkey'
  ) INTO has_fk;

  IF NOT has_fk THEN
    -- Verifica existência das colunas
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'Profile' AND column_name = 'clube'
    ) INTO has_clube;

    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'Profile' AND column_name = 'clube_new'
    ) INTO has_clube_new;

    -- Garante a coluna temporária "clube_new"
    IF NOT has_clube_new THEN
      EXECUTE 'ALTER TABLE "Profile" ADD COLUMN "clube_new" TEXT';
    END IF;

    -- Se a coluna antiga "clube" ainda existe, faz o mapeamento para Times.id e remove a antiga
    IF has_clube THEN
      EXECUTE $sql$
        UPDATE "Profile" p
        SET "clube_new" = t."id"
        FROM "Times" t
        WHERE p."clube" IS NOT NULL
          AND LOWER(t."clube") = LOWER(p."clube")
      $sql$;

      -- Tenta dropar a antiga "clube" somente se ela ainda existe
      EXECUTE 'ALTER TABLE "Profile" DROP COLUMN IF EXISTS "clube"';
    END IF;

    -- Renomeia "clube_new" para "clube" apenas se "clube" ainda não existir
    PERFORM 1
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'Profile' AND column_name = 'clube';
    IF NOT FOUND THEN
      -- Há "clube_new" para renomear?
      PERFORM 1
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'Profile' AND column_name = 'clube_new';
      IF FOUND THEN
        EXECUTE 'ALTER TABLE "Profile" RENAME COLUMN "clube_new" TO "clube"';
      END IF;
    END IF;

    -- Cria a FK somente se:
    --   - a coluna "clube" existe,
    --   - a tabela "Times" existe,
    --   - e a constraint ainda não existe
    IF EXISTS (
         SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = 'Profile' AND column_name = 'clube'
       )
       AND EXISTS (
         SELECT 1 FROM information_schema.tables
         WHERE table_schema = 'public' AND table_name = 'Times'
       )
       AND NOT EXISTS (
         SELECT 1 FROM pg_constraint WHERE conname = 'Profile_clube_fkey'
       )
    THEN
      EXECUTE 'ALTER TABLE "Profile"
               ADD CONSTRAINT "Profile_clube_fkey"
               FOREIGN KEY ("clube") REFERENCES "Times"("id")
               ON DELETE SET NULL ON UPDATE CASCADE';
    END IF;
  END IF;
END$$;
