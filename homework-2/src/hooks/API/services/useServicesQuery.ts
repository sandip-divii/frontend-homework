"use client";

import { useQuery } from "@tanstack/react-query";
import type { ForcedState } from "@/features/premium-service/forcedState";
import { listServices } from "@/services/expertServices";
import type { ExpertService, PagedResult, ServiceQuery } from "@/types/service";
import { serviceKeys } from "./keys";

export type ListStatus = "loading" | "success" | "empty" | "error";

export interface ServicesListState {
  status: ListStatus;
  data: PagedResult<ExpertService> | null;
  error: string | null;
  /** Re-runs the same query ("Try again"). */
  refetch: () => void;
}

interface UseServicesQueryOptions {
  /** QA hook: pins the result to one state and skips the request. */
  forced?: ForcedState;
}

const EMPTY: PagedResult<ExpertService> = { items: [], total: 0, page: 1, pageSize: 0, totalPages: 1 };
const noop = () => {};

/**
 * List hook: one page of services from GET /api/services, cached by TanStack Query under
 * `serviceKeys.list(query)`. A new query key is a new entry, so changing a filter shows the
 * skeleton until that page arrives; the previous request is aborted through the query signal.
 */
export function useServicesQuery(query: ServiceQuery, { forced }: UseServicesQueryOptions = {}): ServicesListState {
  const result = useQuery({
    queryKey: serviceKeys.list(query),
    queryFn: ({ signal }) => listServices(query, signal),
    enabled: !forced,
  });

  if (forced === "loading") return { status: "loading", data: null, error: null, refetch: noop };
  if (forced === "empty") return { status: "empty", data: EMPTY, error: null, refetch: noop };
  if (forced === "error") return { status: "error", data: null, error: "Forced error state", refetch: noop };

  const refetch = () => void result.refetch();
  const waiting = result.isPending || (result.isFetching && result.data === undefined);
  if (waiting) return { status: "loading", data: null, error: null, refetch };
  if (result.isError || !result.data) {
    return { status: "error", data: null, error: result.error?.message ?? "Unknown error", refetch };
  }
  if (result.data.items.length === 0) return { status: "empty", data: result.data, error: null, refetch };
  return { status: "success", data: result.data, error: null, refetch };
}
