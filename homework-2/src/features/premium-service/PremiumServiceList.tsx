"use client";

import { useRef, useState } from "react";
import { CategoryTabs } from "@/components/ui/CategoryTabs/CategoryTabs";
import { Pagination } from "@/components/ui/Pagination/Pagination";
import { SearchField } from "@/components/ui/SearchField/SearchField";
import { SectionTitle } from "@/components/ui/SectionTitle/SectionTitle";
import { SortSelect } from "@/components/ui/SortSelect/SortSelect";
import { ServiceGrid } from "@/components/service/ServiceGrid/ServiceGrid";
import { CATEGORIES, CATEGORY_LABEL, PAGE_SIZE, SORT_OPTIONS } from "@/data/categories";
import { useExpertServices } from "@/hooks/useExpertServices";
import type { CategoryFilter, SortOption } from "@/types/service";
import type { ForcedState } from "./forcedState";
import styles from "./PremiumServiceList.module.scss";

interface PremiumServiceListProps {
  /** QA hook: pins the list to one state (see forcedState.ts). */
  forcedState?: ForcedState;
}

export function PremiumServiceList({ forcedState }: PremiumServiceListProps) {
  const topRef = useRef<HTMLDivElement>(null);
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [draft, setDraft] = useState("");
  const [keyword, setKeyword] = useState("");
  const [sort, setSort] = useState<SortOption>("recommended");
  const [page, setPage] = useState(1);
  const [retryToken, setRetryToken] = useState(0);

  const { status, data } = useExpertServices(
    { category, keyword, sort, page, pageSize: PAGE_SIZE },
    { forced: forcedState, reloadToken: retryToken },
  );

  const sectionTitle = category === "all" ? "All services" : CATEGORY_LABEL[category];

  const changeCategory = (next: CategoryFilter) => {
    setCategory(next);
    setPage(1);
  };

  const submitSearch = (next: string) => {
    setKeyword(next);
    setPage(1);
  };

  const changeSort = (next: SortOption) => {
    setSort(next);
    setPage(1);
  };

  const changePage = (next: number) => {
    setPage(next);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const reset = () => {
    setCategory("all");
    setDraft("");
    setKeyword("");
    setSort("recommended");
    setPage(1);
  };

  const emptyTitle = keyword
    ? `No results for “${keyword}”`
    : category === "all"
      ? "No services yet"
      : `No ${sectionTitle.toLowerCase()} services yet`;
  const emptyDescription = keyword
    ? "Check the spelling or try a product / author name."
    : "Experts have not listed services in this category yet. Please check back soon.";

  return (
    <section className={styles.section} aria-labelledby="service-list-title">
      <div className={styles.inner} ref={topRef}>
        <div className={styles.toolbar}>
          <CategoryTabs value={category} options={CATEGORIES} onChange={changeCategory} />
          <SearchField className={styles.search} value={draft} onChange={setDraft} onSubmit={submitSearch} />
        </div>

        <SectionTitle id="service-list-title" className={styles.title}>
          {sectionTitle}
        </SectionTitle>

        <div className={styles.controls}>
          <SortSelect value={sort} options={SORT_OPTIONS} onChange={changeSort} />
        </div>

        <ServiceGrid
          className={styles.list}
          status={status}
          items={data?.items ?? []}
          skeletonCount={PAGE_SIZE}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
          onReset={reset}
          onRetry={() => setRetryToken((t) => t + 1)}
        />

        {status === "success" && data ? (
          <Pagination className={styles.pagination} page={data.page} totalPages={data.totalPages} onChange={changePage} />
        ) : null}
      </div>
    </section>
  );
}
