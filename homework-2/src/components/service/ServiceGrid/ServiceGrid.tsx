import { Button } from "@/components/ui/Button/Button";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { ServiceCard, ServiceCardSkeleton } from "@/components/service/ServiceCard/ServiceCard";
import type { ListStatus } from "@/hooks/API/services/useServicesQuery";
import type { ExpertService } from "@/types/service";
import { cn } from "@/lib/cn";
import styles from "./ServiceGrid.module.scss";

interface ServiceGridProps {
  status: ListStatus;
  items: readonly ExpertService[];
  skeletonCount?: number;
  /** Shown in the empty state; describes the active filter. */
  emptyTitle?: string;
  emptyDescription?: string;
  onReset?: () => void;
  onRetry?: () => void;
  className?: string;
}

export function ServiceGrid({
  status,
  items,
  skeletonCount = 12,
  emptyTitle = "No services found",
  emptyDescription = "Try another category or search term.",
  onReset,
  onRetry,
  className,
}: ServiceGridProps) {
  return (
    <div
      className={cn(styles.region, className)}
      aria-live="polite"
      aria-busy={status === "loading"}
      data-list-status={status}
    >
      {status === "loading" ? (
        <>
          <p className="sr-only">Loading services…</p>
          <ul className={styles.grid}>
            {Array.from({ length: skeletonCount }, (_, i) => (
              <li key={i}>
                <ServiceCardSkeleton />
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {status === "success" ? (
        <ul className={styles.grid}>
          {items.map((service, index) => (
            <li key={service.id}>
              <ServiceCard service={service} priority={index < 3} />
            </li>
          ))}
        </ul>
      ) : null}

      {status === "empty" ? (
        <EmptyState
          icon="search"
          title={emptyTitle}
          description={emptyDescription}
          action={
            onReset ? (
              <Button variant="outline" size="md" onClick={onReset}>
                Show all services
              </Button>
            ) : undefined
          }
        />
      ) : null}

      {status === "error" ? (
        <EmptyState
          tone="error"
          icon="alert"
          title="Something went wrong"
          description="We could not load the services. Please try again."
          action={
            onRetry ? (
              <Button variant="outline" size="md" onClick={onRetry}>
                Try again
              </Button>
            ) : undefined
          }
        />
      ) : null}
    </div>
  );
}
