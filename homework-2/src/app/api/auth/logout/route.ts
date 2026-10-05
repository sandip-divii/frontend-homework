import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/server/auth/session";

export const dynamic = "force-dynamic";

/** POST /api/auth/logout → 200 { ok: true } and clears the session cookie. */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
