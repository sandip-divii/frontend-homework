import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header/Header";
import { PageHero } from "@/components/layout/PageHero/PageHero";
import { Footer } from "@/components/layout/Footer/Footer";
import { Button } from "@/components/ui/Button/Button";
import { MOCK_SERVICES } from "@/data/services.mock";
import { formatPrice } from "@/lib/format";
import styles from "./page.module.scss";

type DetailPageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const service = MOCK_SERVICES.find((s) => s.id === id);
  return { title: service ? `${service.title} by ${service.author} | Bookplate` : "Service | Bookplate" };
}

/** Placeholder so card links resolve. The detail screen itself is out of scope for Homework 1. */
export default async function ServiceDetailPage({ params }: DetailPageProps) {
  const { id } = await params;
  const service = MOCK_SERVICES.find((s) => s.id === id);
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
        <section className={styles.section}>
          <div className={styles.inner}>
            <p className={styles.meta}>
              {service.author} · {formatPrice(service.price)}
            </p>
            <p className={styles.note}>The service detail screen is not part of Homework 1.</p>
            <Button href="/" variant="outline" size="md">
              Back to the list
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
