// Shared by migrate.mjs and seed.mjs: reads .env.local (unless the vars are already set), returns
// mysql2 connection options with TLS when DATABASE_SSL=true (hosted MySQL such as TiDB Cloud).
import { existsSync } from "node:fs";
import mysql from "mysql2/promise";

export function loadEnv() {
  if (!process.env.DATABASE_URL && existsSync(".env.local")) process.loadEnvFile(".env.local");
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");
    process.exit(1);
  }
  return url;
}

export function connectionOptions(url, extra = {}) {
  const ssl = process.env.DATABASE_SSL === "true" ? { minVersion: "TLSv1.2", rejectUnauthorized: true } : undefined;
  return { uri: url, ssl, ...extra };
}

/** Database name from the URL path, e.g. mysql://u:p@host:4000/homework2 → "homework2". */
export function databaseName(url) {
  return decodeURIComponent(new URL(url).pathname.replace(/^\//, ""));
}

/** Connects to the server without selecting a database (to create it) — same credentials and TLS. */
export async function connectToServer(url) {
  const u = new URL(url);
  u.pathname = "/";
  return mysql.createConnection(connectionOptions(u.toString()));
}

export async function connectToDatabase(url, extra = {}) {
  return mysql.createConnection(connectionOptions(url, extra));
}
