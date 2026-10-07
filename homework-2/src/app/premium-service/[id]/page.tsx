import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header/Header";
import { PageHero } from "@/components/layout/PageHero/PageHero";
import { PageSection } from "@/components/layout/PageSection/PageSection";
import { Footer } from "@/components/layout/Footer/Footer";
import { Badge } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button/Button";
import { Icon } from "@/components/ui/Icon/Icon";
import { CATEGORY_LABEL } from "@/data/categories";
import { ServiceActions } from "@/features/service-detail/ServiceActions";
import { canManageServices } from "@/lib/auth/roles";
import { formatDateTime, formatNumber, formatPrice, formatRating } from "@/lib/format";
import { getSession } from "@/server/auth/session";
import { parseId } from "@/server/http";
import { getServiceById } from "@/server/repositories/expertServices";
import styles from "./page.module.scss";

type DetailPageProps = { params: Promise<{ id: string }> };

async function loadService(rawId: string) {
  const id = parseId(rawId);
  return id ? getServiceById(id) : null;
}

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const service = await loadService((await params).id);
  return { title: service ? `${service.title} by ${service.author} | Bookplate` : "Service | Bookplate" };
}

/** Service details (Server Component → repository). Managers also get Edit / Delete. */
export default async function ServiceDetailPage({ params }: DetailPageProps) {
  const [service, user] = await Promise.all([loadService((await params).id), getSession()]);
  if (!service) notFound();

  return (
    <>
      <Header />
      <main id="main">
        <PageHero
          breadcrumb={[
            { label: "Home.", href: "/" },
            { label: "Premium Paid Services", href: "/" },
            { label: service.title },
          ]}
          title={service.title}
        />
        <PageSection labelledBy="service-detail-title">
          <h2 id="service-detail-title" className="sr-only">
            Service details
          </h2>
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
                  <dd>{formatDateTime(service.createdAt)}</dd>
                </div>
                <div>
                  <dt>Updated</dt>
                  <dd>{formatDateTime(service.updatedAt)}</dd>
                </div>
              </dl>

              <div className={styles.actions}>
                <Button href="/" variant="ghost" size="md">
                  Back to the list
                </Button>
                {canManageServices(user) ? <ServiceActions service={service} /> : null}
              </div>
            </div>
          </article>
        </PageSection>
      </main>
      <Footer />
    </>
  );
}
