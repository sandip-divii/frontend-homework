import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header/Header";
import { PageHero } from "@/components/layout/PageHero/PageHero";
import { Footer } from "@/components/layout/Footer/Footer";
import { Button } from "@/components/ui/Button/Button";
import { formatPrice } from "@/lib/format";
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

/** Reads straight from the repository (Server Component). The full detail screen is HW2 work in progress. */
export default async function ServiceDetailPage({ params }: DetailPageProps) {
  const service = await loadService((await params).id);
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
            {service.description ? <p className={styles.note}>{service.description}</p> : null}
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
