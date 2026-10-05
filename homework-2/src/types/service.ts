export type ServiceCategory = "typo" | "cover" | "internal" | "correction";
export type CategoryFilter = ServiceCategory | "all";

export type SortOption = "recommended" | "newest" | "priceAsc" | "priceDesc" | "rating";

/** Row of `expert_services` as returned by the API. */
export interface ExpertService {
  id: number;
  category: ServiceCategory;
  author: string;
  title: string;
  description: string | null;
  /** Price in KRW (the design shows "15,000" without a currency symbol). */
  price: number;
  likes: number;
  rating: number;
  reviewCount: number;
  thumbnail: string;
  createdBy: number | null;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface ServiceQuery {
  category: CategoryFilter;
  keyword: string;
  sort: SortOption;
  page: number;
  pageSize: number;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
