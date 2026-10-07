import mysql, { type Pool, type PoolOptions, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";
import { env } from "./env";

// One pool per process; cached on globalThis so Next's dev HMR does not leak connections.
const globalForDb = globalThis as unknown as { __homework2Pool?: Pool };

/** TLS for hosted MySQL (TiDB Cloud, Aiven…). Enable with DATABASE_SSL=true; local XAMPP stays plain. */
function sslOptions(): PoolOptions["ssl"] {
  if (process.env.DATABASE_SSL !== "true") return undefined;
  return { minVersion: "TLSv1.2", rejectUnauthorized: true };
}

export function getPool(): Pool {
  if (!globalForDb.__homework2Pool) {
    globalForDb.__homework2Pool = mysql.createPool({
      uri: env.databaseUrl,
      ssl: sslOptions(),
      waitForConnections: true,
      connectionLimit: 10,
      timezone: "Z",
      dateStrings: true,
      namedPlaceholders: false,
    });
  }
  return globalForDb.__homework2Pool;
}

/** Values accepted for `?` placeholders. */
export type SqlParam = string | number | boolean | null | Date | Buffer;

/** SELECT helper. Uses client-side escaping so LIMIT/OFFSET placeholders work on MariaDB. */
export async function query<T extends RowDataPacket>(sql: string, params: SqlParam[] = []): Promise<T[]> {
  const [rows] = await getPool().query<T[]>(sql, params);
  return rows;
}

/** INSERT / UPDATE / DELETE helper (server-side prepared statement). */
export async function execute(sql: string, params: SqlParam[] = []): Promise<ResultSetHeader> {
  const [result] = await getPool().execute<ResultSetHeader>(sql, params);
  return result;
}

/** "YYYY-MM-DD HH:MM:SS" (UTC, from dateStrings) → ISO 8601. */
export function toIso(dateString: string): string {
  return `${dateString.replace(" ", "T")}Z`;
}
