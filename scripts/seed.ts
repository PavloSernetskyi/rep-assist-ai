/**
 * Runs sql/schema.sql then sql/seed.sql against DATABASE_URL.
 * Usage: npm run db:seed
 *
 * Loads .env.local first, then .env (repo root).
 */
import { config } from "dotenv";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Pool } from "pg";

const root = process.cwd();
config({ path: join(root, ".env.local") });
config({ path: join(root, ".env") });

function looksLikePlaceholderUrl(url: string): boolean {
  return (
    /USER:PASSWORD/i.test(url) ||
    /@HOST(?:[:/]|$)/i.test(url) ||
    /\/DATABASE(?:\?|$)/i.test(url)
  );
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL missing. Copy .env.example to .env.local.");
    process.exit(1);
  }
  if (looksLikePlaceholderUrl(url)) {
    console.error(
      "DATABASE_URL still looks like the .env.example placeholder.\n" +
        "In InsForge: Database → Connect (or project settings) → copy the Postgres URI into .env.local,\n" +
        "then run: npm run db:seed"
    );
    process.exit(1);
  }

  const schemaPath = join(root, "sql", "schema.sql");
  const seedPath = join(root, "sql", "seed.sql");
  const schemaSql = readFileSync(schemaPath, "utf8");
  const seedSql = readFileSync(seedPath, "utf8");

  const ssl =
    process.env.DATABASE_SSL === "false" ||
    url.includes("localhost") ||
    url.includes("127.0.0.1")
      ? false
      : { rejectUnauthorized: false };

  const pool = new Pool({ connectionString: url, ssl });
  try {
    console.log("Applying schema…");
    await pool.query(schemaSql);
    console.log("Seeding demo data…");
    await pool.query(seedSql);
    console.log("Done.");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
