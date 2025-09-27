const { Client } = require("pg");

const MIGRATION_ID = "20241021120000_add_confederation_details";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL não definido. Pulando verificação de migração.");
    process.stdout.write("false\n");
    return;
  }

  const client = new Client({ connectionString: databaseUrl });

  try {
    await client.connect();

    const tableExistsResult = await client.query(
      "SELECT to_regclass('_prisma_migrations') IS NOT NULL AS exists"
    );
    const tableExists = tableExistsResult.rows[0]?.exists;

    if (!tableExists) {
      process.stdout.write("false\n");
      return;
    }

    const migrationResult = await client.query(
      'SELECT "finished_at", "rolled_back_at" FROM "_prisma_migrations" WHERE "migration_id" = $1 LIMIT 1',
      [MIGRATION_ID]
    );

    if (migrationResult.rowCount === 0) {
      process.stdout.write("false\n");
      return;
    }

    const migration = migrationResult.rows[0];
    const isFailed = migration.finished_at === null && migration.rolled_back_at === null;

    process.stdout.write(`${isFailed}\n`);
  } catch (error) {
    console.error("Falha ao verificar estado da migração", error);
    process.stdout.write("false\n");
  } finally {
    await client.end().catch(() => undefined);
  }
}

main();
