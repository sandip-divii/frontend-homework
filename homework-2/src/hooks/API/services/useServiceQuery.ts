"use client";

import { useQuery } from "@tanstack/react-query";
import { getService } from "@/services/expertServices";
import type { ExpertService } from "@/types/service";
import { serviceKeys } from "./keys";

/**
 * Details hook: one service under `serviceKeys.detail(id)`.
 * The Server Component page already loaded the row (for the 404 and the <title>), so it is passed
 * as `initialData`; the entry stays fresh for a minute unless a mutation invalidates or replaces it.
 */
export function useServiceQuery(id: number, initialData: ExpertService) {
  return useQuery({
    queryKey: serviceKeys.detail(id),
    queryFn: ({ signal }) => getService(id, signal),
    initialData,
    staleTime: 60_000,
  });
}
