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

/**
 * Round trip list → detail / form → list. Screens opened from the list carry the list's query in
 * `?back=` (e.g. `/premium-service/13?back=category%3Dcover%26page%3D2`), and every way back to the
 * list (Back to the list, Cancel, after create / edit / delete) returns to that exact list.
 */
export const BACK_PARAM = "back";

/** The list's own query without QA keys or defaults, e.g. "category=cover&page=2" ("" for the plain list). */
export function listQuery(params: ListParams): string {
  return writeListParams(new URLSearchParams(), params).toString();
}

/**
 * Validates a raw `?back=` value: it is re-parsed into ListParams and written again, so only the
 * known keys with valid values survive and it can never point anywhere but the list.
 */
export function cleanBack(raw: string | string[] | null | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value ? listQuery(readListParams(new URLSearchParams(value))) : "";
}

/** "/?category=cover&page=2", or "/" when there is nothing to keep. */
export function listHref(back: string): string {
  return back ? `/?${back}` : "/";
}

/** `path?back=<list query>` so the next screen can return to the same list. */
export function withBack(path: string, back: string): string {
  return back ? `${path}?${BACK_PARAM}=${encodeURIComponent(back)}` : path;
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
