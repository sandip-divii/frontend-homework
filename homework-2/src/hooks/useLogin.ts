"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { LoginInput } from "@/lib/validation/auth";
import { LOGIN_MESSAGES } from "@/lib/validation/auth";
import { login } from "@/services/auth";
import { ApiError } from "@/services/http";

export type LoginField = "id" | "password";

export interface LoginError {
  field?: LoginField;
  message: string;
}

export function useLogin(redirectTo = "/") {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<LoginError | null>(null);

  async function submit(input: LoginInput): Promise<boolean> {
    setPending(true);
    setError(null);
    try {
      await login(input);
      router.push(redirectTo);
      router.refresh(); // re-render Server Components (header) with the new session
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        const field = err.fields?.id ? "id" : err.fields?.password ? "password" : undefined;
        setError({ field, message: field ? err.fields![field]![0] : err.message });
      } else {
        setError({ message: LOGIN_MESSAGES.network });
      }
      return false;
    } finally {
      setPending(false);
    }
  }

  return { submit, pending, error };
}
