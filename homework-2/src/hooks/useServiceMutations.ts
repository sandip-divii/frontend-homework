"use client";

import { useState } from "react";
import type { ServiceInput } from "@/lib/validation/service";
import { createService, deleteService, updateService } from "@/services/expertServices";
import type { ExpertService } from "@/types/service";

/**
 * Create / update / delete through the expertServices service.
 * Errors are re-thrown (as ApiError for API failures) so the caller decides how to show them.
 */
export function useServiceMutations() {
  const [pending, setPending] = useState(false);

  async function run<T>(task: () => Promise<T>): Promise<T> {
    setPending(true);
    try {
      return await task();
    } finally {
      setPending(false);
    }
  }

  return {
    pending,
    create: (input: ServiceInput): Promise<ExpertService> => run(() => createService(input)),
    update: (id: number, input: ServiceInput): Promise<ExpertService> => run(() => updateService(id, input)),
    remove: (id: number): Promise<void> => run(() => deleteService(id)),
  };
}
