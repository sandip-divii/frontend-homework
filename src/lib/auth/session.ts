import { cookies } from "next/headers";
import { findUser, type MockUser } from "@/data/users.mock";

export const SESSION_COOKIE = "bp_session";
export const SAVED_ID_COOKIE = "bp_saved_id";

const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours
const SAVED_ID_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/** Server-only: the signed-in mock user, or null. */
export async function getSession(): Promise<MockUser | null> {
  const store = await cookies();
  const id = store.get(SESSION_COOKIE)?.value;
  return id ? (findUser(id) ?? null) : null;
}

export async function getSavedId(): Promise<string> {
  const store = await cookies();
  return store.get(SAVED_ID_COOKIE)?.value ?? "";
}

export async function createSession(user: MockUser, saveId: boolean): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, user.id, { httpOnly: true, sameSite: "lax", path: "/", maxAge: SESSION_MAX_AGE });
  if (saveId) {
    store.set(SAVED_ID_COOKIE, user.id, { sameSite: "lax", path: "/", maxAge: SAVED_ID_MAX_AGE });
  } else {
    store.delete(SAVED_ID_COOKIE);
  }
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
