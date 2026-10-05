// Applies db/schema.sql to DATABASE_URL. Usage: npm run db:migrate
import { existsSync, readFileSync } from "node:fs";
import mysql from "mysql2/promise";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");
  process.exit(1);
}

const sql = readFileSync(new URL("./schema.sql", import.meta.url), "utf8");
const conn = await mysql.createConnection({ uri: url, multipleStatements: true });
try {
  await conn.query(sql);
  const [rows] = await conn.query("SHOW TABLES");
  console.log(`migrated ${new URL(url).pathname.slice(1)}: ${rows.map((r) => Object.values(r)[0]).join(", ")}`);
} finally {
  await conn.end();
}
