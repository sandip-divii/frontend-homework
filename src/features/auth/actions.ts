"use server";

import { redirect } from "next/navigation";
import { findUser } from "@/data/users.mock";
import { createSession, destroySession } from "@/lib/auth/session";
import { LOGIN_MESSAGES, type LoginState } from "./loginState";

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const id = String(formData.get("id") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const saveId = formData.get("saveId") === "on";

  if (!id) return { error: { field: "id", message: LOGIN_MESSAGES.idRequired } };
  if (!password) return { error: { field: "password", message: LOGIN_MESSAGES.passwordRequired } };

  const user = findUser(id);
  if (!user) return { error: { field: "id", message: LOGIN_MESSAGES.idUnknown } };
  if (user.password !== password) return { error: { field: "password", message: LOGIN_MESSAGES.mismatch } };

  await createSession(user, saveId);
  redirect("/");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/login");
}
