import { Header } from "@/components/layout/Header/Header";
import { PageHero } from "@/components/layout/PageHero/PageHero";
import { PageSection } from "@/components/layout/PageSection/PageSection";
import { Footer } from "@/components/layout/Footer/Footer";
import { Button } from "@/components/ui/Button/Button";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { ROLE_MESSAGES } from "@/lib/auth/roles";

interface ForbiddenProps {
  title?: string;
}

/** Full page shown to a signed-in user whose role cannot open a manager-only screen (403). */
export function Forbidden({ title = "Not allowed" }: ForbiddenProps) {
  return (
    <>
      <Header />
      <main id="main">
        <PageHero breadcrumb={[{ label: "Home.", href: "/" }, { label: title }]} title={title} />
        <PageSection>
          <EmptyState
            tone="error"
            icon="alert"
            title="You do not have permission to open this page"
            description={ROLE_MESSAGES.forbidden}
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
