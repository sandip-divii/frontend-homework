import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header/Header";
import { PageHero } from "@/components/layout/PageHero/PageHero";
import { PageSection } from "@/components/layout/PageSection/PageSection";
import { Footer } from "@/components/layout/Footer/Footer";
import { ServiceDetail } from "@/features/service-detail/ServiceDetail";
import { canManageServices } from "@/lib/auth/roles";
import { getSession } from "@/server/auth/session";
import { parseId } from "@/server/http";
import { getServiceById } from "@/server/repositories/expertServices";

type DetailPageProps = { params: Promise<{ id: string }> };

async function loadService(rawId: string) {
  const id = parseId(rawId);
  return id ? getServiceById(id) : null;
}

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const service = await loadService((await params).id);
  return { title: service ? `${service.title} by ${service.author} | Bookplate` : "Service | Bookplate" };
}

/**
 * Service details. The Server Component loads the row once (404 + <title>) and hands it to the
 * client `ServiceDetail`, whose details hook keeps it in the TanStack Query cache.
 */
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
          <ServiceDetail initial={service} canManage={canManageServices(user)} />
        </PageSection>
      </main>
      <Footer />
    </>
  );
}
