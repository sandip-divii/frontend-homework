import type { ServiceInput } from "@/lib/validation/service";
import type { ExpertService, PagedResult, ServiceQuery } from "@/types/service";
import { apiFetch } from "./http";

const BASE = "/api/services";

export function listServices(query: ServiceQuery, signal?: AbortSignal): Promise<PagedResult<ExpertService>> {
  const params = new URLSearchParams({
    category: query.category,
    q: query.keyword,
    sort: query.sort,
    page: String(query.page),
    pageSize: String(query.pageSize),
  });
  return apiFetch<PagedResult<ExpertService>>(`${BASE}?${params}`, { signal });
}

export function getService(id: number, signal?: AbortSignal): Promise<ExpertService> {
  return apiFetch<ExpertService>(`${BASE}/${id}`, { signal });
}

export function createService(input: ServiceInput): Promise<ExpertService> {
  return apiFetch<ExpertService>(BASE, { method: "POST", body: JSON.stringify(input) });
}

export function updateService(id: number, input: ServiceInput): Promise<ExpertService> {
  return apiFetch<ExpertService>(`${BASE}/${id}`, { method: "PUT", body: JSON.stringify(input) });
}

export function deleteService(id: number): Promise<void> {
  return apiFetch<void>(`${BASE}/${id}`, { method: "DELETE" });
}
