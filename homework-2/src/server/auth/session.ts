import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { findUserById } from "@/server/repositories/users";
import type { PublicUser } from "@/types/user";
import { readSessionToken } from "./token";

export const SESSION_COOKIE = "bp_session";
export const SAVED_ID_COOKIE = "bp_saved_id";

export const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours
export const SAVED_ID_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
};

export const savedIdCookieOptions = {
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SAVED_ID_TTL_SECONDS,
};

async function userFromToken(token: string | undefined): Promise<PublicUser | null> {
  const userId = readSessionToken(token);
  return userId ? findUserById(userId) : null;
}

/** Server Components / Server Actions: the signed-in user or null. */
export async function getSession(): Promise<PublicUser | null> {
  const store = await cookies();
  return userFromToken(store.get(SESSION_COOKIE)?.value);
}

/** Route handlers: the signed-in user or null. */
export async function getSessionFromRequest(req: NextRequest): Promise<PublicUser | null> {
  return userFromToken(req.cookies.get(SESSION_COOKIE)?.value);
}

export async function getSavedId(): Promise<string> {
  const store = await cookies();
  return store.get(SAVED_ID_COOKIE)?.value ?? "";
}
