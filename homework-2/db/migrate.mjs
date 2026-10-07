// Creates the database if missing, then applies db/schema.sql. Usage: npm run db:migrate
import { readFileSync } from "node:fs";
import { connectToDatabase, connectToServer, databaseName, loadEnv } from "./connection.mjs";

const url = loadEnv();
const name = databaseName(url);

const server = await connectToServer(url);
try {
  await server.query(`CREATE DATABASE IF NOT EXISTS \`${name.replace(/`/g, "``")}\` DEFAULT CHARACTER SET utf8mb4`);
} finally {
  await server.end();
}

const sql = readFileSync(new URL("./schema.sql", import.meta.url), "utf8");
const conn = await connectToDatabase(url, { multipleStatements: true });
try {
  await conn.query(sql);
  const [rows] = await conn.query("SHOW TABLES");
  console.log(`migrated ${name} @ ${new URL(url).host}: ${rows.map((r) => Object.values(r)[0]).join(", ")}`);
} finally {
  await conn.end();
}
