import { Icon } from "@/components/ui/Icon/Icon";
import { cn } from "@/lib/cn";
import styles from "./Pagination.module.scss";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  /** How many page numbers are visible at once (design shows 10). */
  windowSize?: number;
  className?: string;
}

function pageWindow(page: number, totalPages: number, size: number): number[] {
  const count = Math.min(size, totalPages);
  let start = Math.max(1, page - Math.floor(count / 2));
  start = Math.min(start, totalPages - count + 1);
  return Array.from({ length: count }, (_, i) => start + i);
}

export function Pagination({ page, totalPages, onChange, windowSize = 10, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = pageWindow(page, totalPages, windowSize);
  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  const go = (next: number) => () => {
    if (next < 1 || next > totalPages || next === page) return;
    onChange(next);
  };

  return (
    <nav className={cn(styles.pagination, className)} aria-label="Pagination">
      <button type="button" className={styles.arrow} onClick={go(1)} disabled={isFirst} aria-label="First page">
        <Icon name="chevronsLeft" size={16} />
      </button>
      <button type="button" className={styles.arrow} onClick={go(page - 1)} disabled={isFirst} aria-label="Previous page">
        <Icon name="chevronLeft" size={16} />
      </button>

      <ol className={styles.list}>
        {pages.map((n) => (
          <li key={n}>
            <button
              type="button"
              className={cn(styles.page, n === page && styles.active)}
              onClick={go(n)}
              aria-current={n === page ? "page" : undefined}
              aria-label={`Page ${n}`}
            >
              {n}
            </button>
          </li>
        ))}
      </ol>

      <button type="button" className={styles.arrow} onClick={go(page + 1)} disabled={isLast} aria-label="Next page">
        <Icon name="chevronRight" size={16} />
      </button>
      <button type="button" className={styles.arrow} onClick={go(totalPages)} disabled={isLast} aria-label="Last page">
        <Icon name="chevronsRight" size={16} />
      </button>
    </nav>
  );
}
