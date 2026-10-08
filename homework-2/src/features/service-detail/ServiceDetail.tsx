"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button/Button";
import { Icon } from "@/components/ui/Icon/Icon";
import { LocalDateTime } from "@/components/ui/LocalDateTime/LocalDateTime";
import { CATEGORY_LABEL } from "@/data/categories";
import { useServiceQuery } from "@/hooks/API/services/useServiceQuery";
import { formatNumber, formatPrice, formatRating } from "@/lib/format";
import type { ExpertService } from "@/types/service";
import { ServiceActions } from "./ServiceActions";
import styles from "./ServiceDetail.module.scss";

interface ServiceDetailProps {
  /** Row loaded by the Server Component page; seeds the details query. */
  initial: ExpertService;
  /** Experts / admins get Edit / Delete. */
  canManage: boolean;
}

/** Detail body. Reads the service through the details hook so edits and deletes keep the cache in step. */
export function ServiceDetail({ initial, canManage }: ServiceDetailProps) {
  const { data: service } = useServiceQuery(initial.id, initial);

  return (
    <article className={styles.detail} data-service-id={service.id}>
      <figure className={styles.figure}>
        <Image src={service.thumbnail} alt="" fill sizes="(max-width: 768px) 100vw, 520px" priority unoptimized />
        <Badge className={styles.badge}>{CATEGORY_LABEL[service.category]}</Badge>
      </figure>

      <div className={styles.info}>
        <p className={styles.author}>{service.author}</p>
        <p className={styles.price}>
          <span className={styles["price-value"]}>{formatPrice(service.price)}</span>
          <span className={styles["price-unit"]}>KRW</span>
        </p>

        <ul className={styles.meta}>
          <li className={styles["meta-item"]}>
            <Icon name="heart" size={20} className={styles.heart} />
            <span>
              <span className="sr-only">Likes </span>
              {formatNumber(service.likes)}
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

        {service.description ? (
          <p className={styles.description}>{service.description}</p>
        ) : (
          <p className={styles["description-empty"]}>No description yet.</p>
        )}

        <dl className={styles.dates}>
          <div>
            <dt>Created</dt>
            <dd>
              <LocalDateTime iso={service.createdAt} />
            </dd>
          </div>
          <div>
            <dt>Updated</dt>
            <dd>
              <LocalDateTime iso={service.updatedAt} />
            </dd>
          </div>
        </dl>

        <div className={styles.actions}>
          <Button href="/" variant="ghost" size="md">
            Back to the list
          </Button>
          {canManage ? <ServiceActions service={service} /> : null}
        </div>
      </div>
    </article>
  );
}
