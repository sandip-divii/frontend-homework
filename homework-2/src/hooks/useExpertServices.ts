"use client";

import { useEffect, useState } from "react";
import { listServices } from "@/services/expertServices";
import type { ExpertService, PagedResult, ServiceQuery } from "@/types/service";
import type { ForcedState } from "@/features/premium-service/forcedState";

export type ListStatus = "loading" | "success" | "empty" | "error";

export interface ExpertServicesState {
  status: ListStatus;
  data: PagedResult<ExpertService> | null;
  error: string | null;
}

interface UseExpertServicesOptions {
  /** QA hook: pins the result to one state regardless of data. */
  forced?: ForcedState;
  /** Bump to re-run the same query (e.g. "Try again"). */
  reloadToken?: number;
}

interface Resolved {
  key: string;
  data: PagedResult<ExpertService> | null;
  error: string | null;
}

const EMPTY: PagedResult<ExpertService> = { items: [], total: 0, page: 1, pageSize: 0, totalPages: 1 };

/**
 * Loads one page of services from /api/services through the expertServices service.
 * Status is derived, never stored, so a query change flips back to "loading" synchronously.
 */
export function useExpertServices(query: ServiceQuery, options: UseExpertServicesOptions = {}): ExpertServicesState {
  const { forced, reloadToken = 0 } = options;
  const { category, keyword, sort, page, pageSize } = query;
  const key = JSON.stringify([category, keyword, sort, page, pageSize, reloadToken]);
  const [resolved, setResolved] = useState<Resolved | null>(null);

  useEffect(() => {
    if (forced) return;
    const controller = new AbortController();
    listServices({ category, keyword, sort, page, pageSize }, controller.signal)
      .then((data) => setResolved({ key, data, error: null }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setResolved({ key, data: null, error: err instanceof Error ? err.message : "Unknown error" });
      });
    return () => controller.abort();
  }, [category, keyword, sort, page, pageSize, key, forced]);

  if (forced === "loading") return { status: "loading", data: null, error: null };
  if (forced === "empty") return { status: "empty", data: EMPTY, error: null };
  if (forced === "error") return { status: "error", data: null, error: "Forced error state" };

  if (!resolved || resolved.key !== key) return { status: "loading", data: null, error: null };
  if (resolved.error || !resolved.data) return { status: "error", data: null, error: resolved.error };
  if (resolved.data.items.length === 0) return { status: "empty", data: resolved.data, error: null };
  return { status: "success", data: resolved.data, error: null };
}
