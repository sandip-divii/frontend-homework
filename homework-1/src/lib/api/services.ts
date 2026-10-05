import { MOCK_SERVICES } from "@/data/services.mock";
import type { ExpertService, PagedResult, ServiceQuery, SortOption } from "@/types/service";

const DEFAULT_DELAY_MS = 700;

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

const SORTERS: Record<SortOption, (a: ExpertService, b: ExpertService) => number> = {
  recommended: () => 0,
  newest: (a, b) => b.createdAt - a.createdAt,
  priceAsc: (a, b) => a.price - b.price,
  priceDesc: (a, b) => b.price - a.price,
  rating: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
};

export function queryServices(query: ServiceQuery): PagedResult<ExpertService> {
  const keyword = query.keyword.trim().toLowerCase();
  const filtered = MOCK_SERVICES.filter((s) => {
    if (query.category !== "all" && s.category !== query.category) return false;
    if (!keyword) return true;
    return s.title.toLowerCase().includes(keyword) || s.author.toLowerCase().includes(keyword);
  });

  const sorted = query.sort === "recommended" ? filtered : [...filtered].sort(SORTERS[query.sort]);

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / query.pageSize));
  const page = Math.min(Math.max(1, query.page), totalPages);
  const start = (page - 1) * query.pageSize;

  return {
    items: sorted.slice(start, start + query.pageSize),
    total,
    page,
    pageSize: query.pageSize,
    totalPages,
  };
}

/** Mock network call — swap the body for a real `fetch` when the API exists. */
export async function fetchExpertServices(
  query: ServiceQuery,
  options: { signal?: AbortSignal; delayMs?: number } = {},
): Promise<PagedResult<ExpertService>> {
  await sleep(options.delayMs ?? DEFAULT_DELAY_MS, options.signal);
  return queryServices(query);
}
