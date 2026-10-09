"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { CategoryTabs } from "@/components/ui/CategoryTabs/CategoryTabs";
import { Pagination } from "@/components/ui/Pagination/Pagination";
import { SearchField } from "@/components/ui/SearchField/SearchField";
import { SectionTitle } from "@/components/ui/SectionTitle/SectionTitle";
import { SortSelect } from "@/components/ui/SortSelect/SortSelect";
import { ServiceGrid } from "@/components/service/ServiceGrid/ServiceGrid";
import { CATEGORIES, CATEGORY_LABEL, PAGE_SIZE, SORT_OPTIONS } from "@/data/categories";
import { useServicesQuery } from "@/hooks/API/services/useServicesQuery";
import type { ForcedState } from "./forcedState";
import { DEFAULT_LIST_PARAMS, listQuery, readListParams, withBack, writeListParams, type ListParams } from "./listParams";
import styles from "./PremiumServiceList.module.scss";

interface PremiumServiceListProps {
  /** QA hook: pins the list to one state (see forcedState.ts). */
  forcedState?: ForcedState;
  /** Experts / admins see the "Add service" button. */
  canManage?: boolean;
}

/**
 * List screen. Filter state (category, keyword, sort, page) lives in the URL query string; links to the
 * detail and create screens carry it in `?back=`, so every way back (Back to the list, Cancel, after
 * create / edit / delete) lands on the same list. The search box draft is local until submitted.
 * Server data comes from the TanStack Query list hook.
 */
export function PremiumServiceList({ forcedState, canManage = false }: PremiumServiceListProps) {
  const topRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useMemo(() => readListParams(searchParams), [searchParams]);
  const [draft, setDraft] = useState(params.keyword);
  // Cards and "Add service" carry the current list in ?back=, so those screens can return to it.
  const back = listQuery(params);

  const { status, data, refetch } = useServicesQuery(
    { category: params.category, keyword: params.keyword, sort: params.sort, page: params.page, pageSize: PAGE_SIZE },
    { forced: forcedState },
  );

  // Native replaceState is picked up by useSearchParams without a server round trip (Next.js >= 14.1).
  const setParams = (patch: Partial<ListParams>) => {
    const query = writeListParams(searchParams, { ...params, ...patch }).toString();
    window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
  };

  const sectionTitle = params.category === "all" ? "All services" : CATEGORY_LABEL[params.category];

  const changePage = (next: number) => {
    setParams({ page: next });
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const reset = () => {
    setDraft("");
    setParams(DEFAULT_LIST_PARAMS);
  };

  const emptyTitle = params.keyword
    ? `No results for “${params.keyword}”`
    : params.category === "all"
      ? "No services yet"
      : `No ${sectionTitle.toLowerCase()} services yet`;
  const emptyDescription = params.keyword
    ? "Check the spelling or try a product / author name."
    : "Experts have not listed services in this category yet. Please check back soon.";

  return (
    <section className={styles.section} aria-labelledby="service-list-title">
      <div className={styles.inner} ref={topRef}>
        <div className={styles.toolbar}>
          <CategoryTabs value={params.category} options={CATEGORIES} onChange={(category) => setParams({ category, page: 1 })} />
          <SearchField
            className={styles.search}
            value={draft}
            onChange={setDraft}
            onSubmit={(keyword) => setParams({ keyword, page: 1 })}
          />
        </div>

        <SectionTitle id="service-list-title" className={styles.title}>
          {sectionTitle}
        </SectionTitle>

        <div className={styles.controls}>
          {canManage ? (
            <Button href={withBack("/premium-service/new", back)} size="md" icon="arrowRight">
              Add service
            </Button>
          ) : (
            <span />
          )}
          <SortSelect value={params.sort} options={SORT_OPTIONS} onChange={(sort) => setParams({ sort, page: 1 })} />
        </div>

        <ServiceGrid
          className={styles.list}
          status={status}
          items={data?.items ?? []}
          itemHref={(service) => withBack(`/premium-service/${service.id}`, back)}
          skeletonCount={PAGE_SIZE}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
          onReset={reset}
          onRetry={refetch}
        />

        {status === "success" && data ? (
          <Pagination className={styles.pagination} page={data.page} totalPages={data.totalPages} onChange={changePage} />
        ) : null}
      </div>
    </section>
  );
}
