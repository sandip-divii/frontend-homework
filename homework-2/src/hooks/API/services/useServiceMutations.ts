"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ServiceInput } from "@/lib/validation/service";
import { createService, deleteService, updateService } from "@/services/expertServices";
import { serviceKeys } from "./keys";

/**
 * Mutations for the services domain. Each one talks to the service layer and, on success,
 * invalidates the list entries (every search / filter / page) and the details entry it touched,
 * so any mounted list or detail refetches and the next visit does not show stale data.
 * Errors are not handled here: callers decide between field errors, a form alert or a toast.
 */

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ServiceInput) => createService(input),
    onSuccess: async (created) => {
      queryClient.setQueryData(serviceKeys.detail(created.id), created);
      await queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ServiceInput }) => updateService(id, input),
    onSuccess: async (updated, { id }) => {
      queryClient.setQueryData(serviceKeys.detail(id), updated); // the PUT response is the newest row
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: serviceKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: serviceKeys.detail(id) }),
      ]);
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteService(id),
    onSuccess: async (_, id) => {
      queryClient.removeQueries({ queryKey: serviceKeys.detail(id) });
      await queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
    },
  });
}
