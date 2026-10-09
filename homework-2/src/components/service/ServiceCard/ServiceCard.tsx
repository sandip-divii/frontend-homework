import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge/Badge";
import { Icon } from "@/components/ui/Icon/Icon";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import { CATEGORY_LABEL } from "@/data/categories";
import { formatPrice, formatRating } from "@/lib/format";
import type { ExpertService } from "@/types/service";
import styles from "./ServiceCard.module.scss";

interface ServiceCardProps {
  service: ExpertService;
  /** Detail link; the list passes one that carries its filters. Defaults to the plain detail URL. */
  href?: string;
  /** True for above-the-fold cards so the LCP image is not lazy-loaded. */
  priority?: boolean;
}

const IMAGE_SIZES = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 413px";

export function ServiceCard({ service, href = `/premium-service/${service.id}`, priority = false }: ServiceCardProps) {

  return (
    <article className={styles.card}>
      <div className={styles.thumb}>
        <Image src={service.thumbnail} alt="" fill sizes={IMAGE_SIZES} priority={priority} unoptimized />
        <Badge className={styles.badge}>{CATEGORY_LABEL[service.category]}</Badge>
      </div>

      <div className={styles.body}>
        <p className={styles.author}>{service.author}</p>
        <h3 className={styles.title}>
          {/* Stretched link: the whole card is clickable, one tab stop. */}
          <Link href={href} className={styles["title-link"]}>
            {service.title}
          </Link>
        </h3>
        <p className={styles.price}>{formatPrice(service.price)}</p>

        <ul className={styles.meta}>
          <li className={styles["meta-item"]}>
            <Icon name="heart" size={20} className={styles.heart} />
            <span>
              <span className="sr-only">Likes </span>
              {service.likes}
            </span>
          </li>
          <li className={styles["meta-item"]}>
            <Icon name="star" size={20} className={styles.star} />
            <span>
              <span className="sr-only">Rating </span>
              {formatRating(service.rating, service.reviewCount)}
            </span>
          </li>
        </ul>
      </div>
    </article>
  );
}

/** Same geometry as ServiceCard so the layout does not jump when data arrives (sizes are tokens in the stylesheet). */
export function ServiceCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden="true">
      <div className={styles.thumb}>
        <Skeleton className={styles["skel-thumb"]} />
      </div>
      <div className={styles.body}>
        <Skeleton className={styles["skel-author"]} />
        <Skeleton className={styles["skel-title"]} />
        <Skeleton className={styles["skel-price"]} />
        <div className={styles.meta}>
          <Skeleton className={styles["skel-likes"]} />
          <Skeleton className={styles["skel-rating"]} />
        </div>
      </div>
    </div>
  );
}
