import type { LoginInput } from "@/lib/validation/auth";
import type { PublicUser } from "@/types/user";
import { apiFetch } from "./http";

export function login(input: LoginInput): Promise<{ user: PublicUser }> {
  return apiFetch<{ user: PublicUser }>("/api/auth/login", { method: "POST", body: JSON.stringify(input) });
}

export function logout(): Promise<{ ok: true }> {
  return apiFetch<{ ok: true }>("/api/auth/logout", { method: "POST" });
}

export function me(): Promise<{ user: PublicUser }> {
  return apiFetch<{ user: PublicUser }>("/api/auth/me");
}
