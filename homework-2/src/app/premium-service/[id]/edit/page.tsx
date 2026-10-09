import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/layout/Header/Header";
import { Forbidden } from "@/components/layout/Forbidden/Forbidden";
import { PageHero } from "@/components/layout/PageHero/PageHero";
import { PageSection } from "@/components/layout/PageSection/PageSection";
import { Footer } from "@/components/layout/Footer/Footer";
import { cleanBack, listHref, withBack } from "@/features/premium-service/listParams";
import { ServiceForm } from "@/features/service-form/ServiceForm";
import { canManageServices } from "@/lib/auth/roles";
import { getSession } from "@/server/auth/session";
import { parseId } from "@/server/http";
import { getServiceById } from "@/server/repositories/expertServices";

type EditPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = { title: "Edit service | Bookplate" };

/** Edit screen: pre-filled from the repository; same auth rules as create. */
export default async function EditServicePage({ params, searchParams }: EditPageProps) {
  const [{ id: rawId }, query] = await Promise.all([params, searchParams]);
  const back = cleanBack(query?.back);
  const id = parseId(rawId);
  if (!id) notFound();

  const user = await getSession();
  if (!user) redirect(`/login?next=${encodeURIComponent(withBack(`/premium-service/${id}/edit`, back))}`);
  if (!canManageServices(user)) return <Forbidden title="Edit service" />;

  const service = await getServiceById(id);
  if (!service) notFound();

  return (
    <>
      <Header />
      <main id="main">
        <PageHero
          breadcrumb={[
            { label: "Home.", href: "/" },
            { label: "Premium Paid Services", href: listHref(back) },
            { label: service.title, href: withBack(`/premium-service/${service.id}`, back) },
            { label: "Edit" },
          ]}
          title={`Edit: ${service.title}`}
        />
        <PageSection soft narrow labelledBy="service-form-title">
          <h2 id="service-form-title" className="sr-only">
            Edit service
          </h2>
          <ServiceForm mode="edit" initial={service} back={back} />
        </PageSection>
      </main>
      <Footer />
    </>
  );
}
