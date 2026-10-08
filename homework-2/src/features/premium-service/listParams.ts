import { SERVICE_CATEGORIES, SORT_IDS } from "@/lib/validation/service";
import type { CategoryFilter, SortOption } from "@/types/service";

/** Search / filter / sort / page of the list. Lives in the URL so it survives navigation and can be shared. */
export interface ListParams {
  category: CategoryFilter;
  keyword: string;
  sort: SortOption;
  page: number;
}

export const DEFAULT_LIST_PARAMS: ListParams = { category: "all", keyword: "", sort: "recommended", page: 1 };

const CATEGORY_VALUES: readonly string[] = ["all", ...SERVICE_CATEGORIES];
const SORT_VALUES: readonly string[] = SORT_IDS;

/** `?category=cover&q=minji&sort=newest&page=2` → ListParams (unknown values fall back to the defaults). */
export function readListParams(searchParams: URLSearchParams): ListParams {
  const category = searchParams.get("category") ?? "";
  const sort = searchParams.get("sort") ?? "";
  const page = Number(searchParams.get("page"));
  return {
    category: CATEGORY_VALUES.includes(category) ? (category as CategoryFilter) : DEFAULT_LIST_PARAMS.category,
    keyword: (searchParams.get("q") ?? "").trim().slice(0, 100),
    sort: SORT_VALUES.includes(sort) ? (sort as SortOption) : DEFAULT_LIST_PARAMS.sort,
    page: Number.isInteger(page) && page > 0 ? page : DEFAULT_LIST_PARAMS.page,
  };
}

/** ListParams → query string, keeping unrelated keys (e.g. `?state=` for QA) and dropping defaults. */
export function writeListParams(searchParams: URLSearchParams, params: ListParams): URLSearchParams {
  const next = new URLSearchParams(searchParams);
  const set = (key: string, value: string, isDefault: boolean) => (isDefault ? next.delete(key) : next.set(key, value));
  set("category", params.category, params.category === DEFAULT_LIST_PARAMS.category);
  set("q", params.keyword, params.keyword === DEFAULT_LIST_PARAMS.keyword);
  set("sort", params.sort, params.sort === DEFAULT_LIST_PARAMS.sort);
  set("page", String(params.page), params.page === DEFAULT_LIST_PARAMS.page);
  return next;
}
