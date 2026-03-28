import { Pool, type QueryResultRow } from "pg";

let pool: Pool | null = null;

/**
 * Postgres pool for InsForge or any Postgres-compatible `DATABASE_URL`.
 * Use only from server code (Route Handlers, Server Actions, scripts).
 */
export function getPool(): Pool {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local (InsForge connection string)."
    );
  }
  if (!pool) {
    const ssl =
      process.env.DATABASE_SSL === "false" ||
      url.includes("localhost") ||
      url.includes("127.0.0.1")
        ? false
        : { rejectUnauthorized: false };
    pool = new Pool({
      connectionString: url,
      max: 10,
      ssl,
    });
  }
  return pool;
}

export async function query<T extends QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const client = getPool();
  const res = await client.query<T>(text, params);
  return res.rows;
}
