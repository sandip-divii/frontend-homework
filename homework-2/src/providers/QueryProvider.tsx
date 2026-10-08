"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

/** One QueryClient per browser session (and per request on the server, so nothing leaks between users). */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000, // a list opened again within 30 s shows the cache first; mutations invalidate it anyway
        retry: 1,
        refetchOnWindowFocus: false, // keeps QA screenshots predictable
      },
    },
  });
}

/** Mounted once in the root layout; every `src/hooks/API` hook reads through it. */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(makeQueryClient);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
