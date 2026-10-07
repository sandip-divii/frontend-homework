import { Header } from "@/components/layout/Header/Header";
import { PageHero } from "@/components/layout/PageHero/PageHero";
import { PageSection } from "@/components/layout/PageSection/PageSection";
import { Footer } from "@/components/layout/Footer/Footer";
import { Button } from "@/components/ui/Button/Button";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";

/** 404 for unknown routes and missing services (notFound()). */
export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main">
        <PageHero breadcrumb={[{ label: "Home.", href: "/" }, { label: "Not found" }]} title="Page not found" />
        <PageSection>
          <EmptyState
            icon="search"
            title="We could not find that page"
            description="The service may have been deleted, or the address is wrong."
            action={
              <Button href="/" variant="outline" size="md">
                Back to the list
              </Button>
            }
          />
        </PageSection>
      </main>
      <Footer />
    </>
  );
}
