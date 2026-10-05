import type { CategoryFilter, ServiceCategory, SortOption } from "@/types/service";

export interface CategoryOption {
  id: CategoryFilter;
  label: string;
}

/**
 * Tab labels. The Figma frame contains machine-translated placeholders
 * ("whole; total; entire", "Vertical bar") — normalised here, see docs/DESIGN-CHECK.md.
 */
export const CATEGORIES: readonly CategoryOption[] = [
  { id: "all", label: "All" },
  { id: "typo", label: "Typo inspection" },
  { id: "cover", label: "Cover design" },
  { id: "internal", label: "Internal design" },
  { id: "correction", label: "Correction / Alignment" },
];

export const CATEGORY_LABEL: Record<ServiceCategory, string> = {
  typo: "Typo inspection",
  cover: "Cover design",
  internal: "Internal design",
  correction: "Correction / Alignment",
};

export interface SortOptionItem {
  id: SortOption;
  label: string;
}

export const SORT_OPTIONS: readonly SortOptionItem[] = [
  { id: "recommended", label: "Recommended order" },
  { id: "newest", label: "Newest" },
  { id: "rating", label: "Highest rated" },
  { id: "priceAsc", label: "Price: low to high" },
  { id: "priceDesc", label: "Price: high to low" },
];

export const PAGE_SIZE = 12;
