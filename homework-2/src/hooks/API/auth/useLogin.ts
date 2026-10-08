"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { LoginInput } from "@/lib/validation/auth";
import { LOGIN_MESSAGES } from "@/lib/validation/auth";
import { login } from "@/services/auth";
import { ApiError } from "@/services/http";

export type LoginField = "id" | "password";

export interface LoginError {
  field?: LoginField;
  message: string;
}

function toLoginError(err: unknown): LoginError {
  if (err instanceof ApiError) {
    const field = err.fields?.id ? "id" : err.fields?.password ? "password" : undefined;
    return { field, message: field ? err.fields![field]![0] : err.message };
  }
  return { message: LOGIN_MESSAGES.network };
}

/** Login mutation: POST /api/auth/login, then navigate and re-render the Server Components (header). */
export function useLogin(redirectTo = "/") {
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: () => {
      router.push(redirectTo);
      router.refresh();
    },
  });

  return {
    submit: (input: LoginInput) =>
      mutation.mutateAsync(input).then(
        () => true,
        () => false,
      ),
    pending: mutation.isPending,
    error: mutation.error ? toLoginError(mutation.error) : null,
  };
}
