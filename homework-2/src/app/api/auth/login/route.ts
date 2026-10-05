import { NextResponse } from "next/server";
import { LOGIN_MESSAGES, loginSchema } from "@/lib/validation/auth";
import { verifyPassword } from "@/server/auth/password";
import { SAVED_ID_COOKIE, SESSION_COOKIE, SESSION_TTL_SECONDS, savedIdCookieOptions, sessionCookieOptions } from "@/server/auth/session";
import { createSessionToken } from "@/server/auth/token";
import { jsonError, readJson, validationError } from "@/server/http";
import { findUserByLoginId } from "@/server/repositories/users";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/login  { id, password, saveId? }
 * 200 { user }            + httpOnly session cookie (and the Save-ID cookie when requested)
 * 401 { error }           unknown ID (fields.id) or wrong password (fields.password)
 * 422 { error.fields }    missing fields
 */
export async function POST(req: Request) {
  const parsed = loginSchema.safeParse(await readJson(req));
  if (!parsed.success) return validationError(parsed.error);
  const { id, password, saveId } = parsed.data;

  const user = await findUserByLoginId(id);
  if (!user) return jsonError(401, LOGIN_MESSAGES.idUnknown, { id: [LOGIN_MESSAGES.idUnknown] });
  if (!verifyPassword(password, user.passwordHash)) {
    return jsonError(401, LOGIN_MESSAGES.mismatch, { password: [LOGIN_MESSAGES.mismatch] });
  }

  const { passwordHash: _omit, ...publicUser } = user;
  void _omit;
  const res = NextResponse.json({ user: publicUser });
  res.cookies.set(SESSION_COOKIE, createSessionToken(user.id, SESSION_TTL_SECONDS), sessionCookieOptions);
  if (saveId) {
    res.cookies.set(SAVED_ID_COOKIE, user.loginId, savedIdCookieOptions);
  } else {
    res.cookies.delete(SAVED_ID_COOKIE);
  }
  return res;
}
