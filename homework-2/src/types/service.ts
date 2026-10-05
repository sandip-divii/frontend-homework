export type ServiceCategory = "typo" | "cover" | "internal" | "correction";
export type CategoryFilter = ServiceCategory | "all";

export type SortOption = "recommended" | "newest" | "priceAsc" | "priceDesc" | "rating";

export interface ExpertService {
  id: string;
  category: ServiceCategory;
  author: string;
  title: string;
  /** Price in KRW (the design shows "15,000" without a currency symbol). */
  price: number;
  likes: number;
  rating: number;
  reviewCount: number;
  thumbnail: string;
  /** Monotonic index used for the "newest" sort in mock data. */
  createdAt: number;
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
