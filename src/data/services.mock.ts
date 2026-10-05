import type { ExpertService, ServiceCategory } from "@/types/service";

const AUTHORS = [
  "Sohui Im",
  "Sohee Im",
  "Sohee Lim",
  "Soyoung Lim",
  "Sohi Lim",
  "Minji Park",
  "Jiwoo Han",
  "Daeun Choi",
];

const TITLES: Record<ServiceCategory, string[]> = {
  cover: ["Cover design", "Book cover design", "Premium cover design", "Minimal cover design"],
  internal: ["Internal design", "Page layout design", "Typesetting & layout"],
  correction: ["Correction / Alignment", "Manuscript proofreading", "Final alignment check"],
  typo: [],
};

const PRICES = [15000, 15000, 20000, 25000, 30000, 12000];
const THUMBS = ["/images/cover-01.svg", "/images/cover-02.svg", "/images/cover-03.svg"];

function build(category: ServiceCategory, count: number, offset: number): ExpertService[] {
  const titles = TITLES[category];
  return Array.from({ length: count }, (_, i) => ({
    id: `${category}-${i + 1}`,
    category,
    author: AUTHORS[(i * 7 + offset) % AUTHORS.length],
    title: titles[i % titles.length],
    price: PRICES[i % PRICES.length],
    likes: 11 + ((i * 3) % 40),
    rating: Number((4.5 - (i % 4) * 0.1).toFixed(1)),
    reviewCount: 43 + ((i * 5) % 60),
    thumbnail: THUMBS[i % THUMBS.length],
    createdAt: offset + i,
  }));
}

/** Fake catalogue. "typo" intentionally has no items so the empty state is reachable from the UI. */
export const MOCK_SERVICES: readonly ExpertService[] = [
  ...build("cover", 36, 0),
  ...build("internal", 8, 100),
  ...build("correction", 6, 200),
];
