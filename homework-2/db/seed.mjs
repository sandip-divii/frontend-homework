// Seeds demo users and expert services. Usage: npm run db:seed   |   npm run db:reset (wipes first)
// Demo passwords live in db/seed/users.json (local dev only) and are stored scrypt-hashed.
import { existsSync, readFileSync } from "node:fs";
import { randomBytes, scryptSync } from "node:crypto";
import mysql from "mysql2/promise";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");
  process.exit(1);
}
const reset = process.argv.includes("--reset");

// Same format as src/server/auth/password.ts
function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  return `scrypt$${salt}$${scryptSync(password, salt, 64).toString("hex")}`;
}

const AUTHORS = ["Sohui Im", "Sohee Im", "Sohee Lim", "Soyoung Lim", "Sohi Lim", "Minji Park", "Jiwoo Han", "Daeun Choi"];
const TITLES = {
  cover: ["Cover design", "Book cover design", "Premium cover design", "Minimal cover design"],
  internal: ["Internal design", "Page layout design", "Typesetting & layout"],
  correction: ["Correction / Alignment", "Manuscript proofreading", "Final alignment check"],
};
const PRICES = [15000, 15000, 20000, 25000, 30000, 12000];
const THUMBS = ["/images/cover-01.svg", "/images/cover-02.svg", "/images/cover-03.svg"];

/** Deterministic catalogue: 36 cover + 8 internal + 6 correction = 50; "typo" left empty on purpose. */
function buildServices() {
  const plan = [
    ["cover", 36, 0],
    ["internal", 8, 100],
    ["correction", 6, 200],
  ];
  const rows = [];
  let n = 0;
  for (const [category, count, offset] of plan) {
    for (let i = 0; i < count; i += 1, n += 1) {
      rows.push({
        category,
        title: TITLES[category][i % TITLES[category].length],
        author: AUTHORS[(i * 7 + offset) % AUTHORS.length],
        description: `${TITLES[category][i % TITLES[category].length]} by ${AUTHORS[(i * 7 + offset) % AUTHORS.length]}. Delivered within 7 working days, two revision rounds included.`,
        price: PRICES[i % PRICES.length],
        likes: 11 + ((i * 3) % 40),
        rating: Number((4.5 - (i % 4) * 0.1).toFixed(1)),
        review_count: 43 + ((i * 5) % 60),
        thumbnail: THUMBS[i % THUMBS.length],
        created_at: new Date(Date.now() - (60 - n) * 3600 * 1000), // older first, so "newest" is meaningful
      });
    }
  }
  return rows;
}

const users = JSON.parse(readFileSync(new URL("./seed/users.json", import.meta.url), "utf8"));
const conn = await mysql.createConnection({ uri: url });
try {
  if (reset) {
    await conn.query("DELETE FROM expert_services");
    await conn.query("DELETE FROM users");
    await conn.query("ALTER TABLE expert_services AUTO_INCREMENT = 1");
    await conn.query("ALTER TABLE users AUTO_INCREMENT = 1");
  }

  for (const u of users) {
    await conn.execute(
      `INSERT INTO users (login_id, password_hash, name, role) VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), name = VALUES(name), role = VALUES(role)`,
      [u.loginId, hashPassword(u.password), u.name, u.role],
    );
  }

  const [[{ count }]] = await conn.query("SELECT COUNT(*) AS count FROM expert_services");
  if (count > 0 && !reset) {
    console.log(`users upserted: ${users.length}; expert_services already has ${count} rows (use --reset to reseed)`);
  } else {
    const [[expert]] = await conn.query("SELECT id FROM users WHERE login_id = ? LIMIT 1", [users[0].loginId]);
    const rows = buildServices().map((s) => [
      s.category, s.title, s.author, s.description, s.price, s.likes, s.rating, s.review_count, s.thumbnail, expert?.id ?? null, s.created_at,
    ]);
    await conn.query(
      `INSERT INTO expert_services (category, title, author, description, price, likes, rating, review_count, thumbnail, created_by, created_at) VALUES ?`,
      [rows],
    );
    console.log(`users upserted: ${users.length}; expert_services inserted: ${rows.length}`);
  }
} finally {
  await conn.end();
}
