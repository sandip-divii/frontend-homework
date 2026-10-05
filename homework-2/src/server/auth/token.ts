import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../env";

interface SessionPayload {
  uid: number;
  exp: number; // unix seconds
}

function sign(payload: string): string {
  return createHmac("sha256", env.sessionSecret).update(payload).digest("base64url");
}

/** Stateless signed token: base64url(JSON payload) + "." + HMAC-SHA256 signature. */
export function createSessionToken(userId: number, ttlSeconds: number): string {
  const payload = Buffer.from(
    JSON.stringify({ uid: userId, exp: Math.floor(Date.now() / 1000) + ttlSeconds } satisfies SessionPayload),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

/** Returns the user id when the token is intact and not expired, otherwise null. */
export function readSessionToken(token: string | undefined): number | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<SessionPayload>;
    if (typeof data.uid !== "number" || typeof data.exp !== "number") return null;
    if (data.exp * 1000 < Date.now()) return null;
    return data.uid;
  } catch {
    return null;
  }
}
