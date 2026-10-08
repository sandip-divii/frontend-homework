import type { ServiceQuery } from "@/types/service";

/**
 * Query keys for the services domain. The list key holds the full query, so every
 * search / filter / sort / page combination is its own cache entry; `lists()` and
 * `details()` are the prefixes the mutations invalidate.
 */
export const serviceKeys = {
  all: ["services"] as const,
  lists: () => [...serviceKeys.all, "list"] as const,
  list: (query: ServiceQuery) => [...serviceKeys.lists(), query] as const,
  details: () => [...serviceKeys.all, "detail"] as const,
  detail: (id: number) => [...serviceKeys.details(), id] as const,
};
