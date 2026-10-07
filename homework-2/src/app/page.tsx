import { Header } from "@/components/layout/Header/Header";
import { PageHero } from "@/components/layout/PageHero/PageHero";
import { Footer } from "@/components/layout/Footer/Footer";
import { ExpertBanner } from "@/components/service/ExpertBanner/ExpertBanner";
import { PremiumServiceList } from "@/features/premium-service/PremiumServiceList";
import { parseForcedState } from "@/features/premium-service/forcedState";
import { canManageServices } from "@/lib/auth/roles";
import { getSession } from "@/server/auth/session";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PremiumServicePage({ searchParams }: PageProps) {
  const [params, user] = await Promise.all([searchParams, getSession()]);
  const forcedState = parseForcedState(params.state);

  return (
    <>
      <Header />
      <main id="main">
        <PageHero
          breadcrumb={[{ label: "Home.", href: "/" }, { label: "Premium Paid Services" }]}
          title="Premium paid service"
        />
        <PremiumServiceList forcedState={forcedState} canManage={canManageServices(user)} />
        <ExpertBanner />
      </main>
      <Footer />
    </>
  );
}
