import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header/Header";
import { Forbidden } from "@/components/layout/Forbidden/Forbidden";
import { PageHero } from "@/components/layout/PageHero/PageHero";
import { PageSection } from "@/components/layout/PageSection/PageSection";
import { Footer } from "@/components/layout/Footer/Footer";
import { ServiceForm } from "@/features/service-form/ServiceForm";
import { canManageServices } from "@/lib/auth/roles";
import { getSession } from "@/server/auth/session";

export const metadata: Metadata = { title: "Add a service | Bookplate" };

const PATH = "/premium-service/new";

/** Create screen. Signed-out users go to /login (and come back); non-managers get a 403 page. */
export default async function NewServicePage() {
  const user = await getSession();
  if (!user) redirect(`/login?next=${encodeURIComponent(PATH)}`);
  if (!canManageServices(user)) return <Forbidden title="Add a service" />;

  return (
    <>
      <Header />
      <main id="main">
        <PageHero
          breadcrumb={[
            { label: "Home.", href: "/" },
            { label: "Premium Paid Services", href: "/" },
            { label: "Add a service" },
          ]}
          title="Add a service"
        />
        <PageSection soft narrow labelledBy="service-form-title">
          <h2 id="service-form-title" className="sr-only">
            New service
          </h2>
          <ServiceForm mode="create" />
        </PageSection>
      </main>
      <Footer />
    </>
  );
}
