"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { logout } from "@/services/auth";

/** Logout mutation: POST /api/auth/logout, then the login page with the signed-out header. */
export function useLogout() {
  const router = useRouter();
  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      router.push("/login");
      router.refresh();
    },
  });
}
