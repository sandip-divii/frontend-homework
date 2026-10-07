import type { Metadata } from "next";
import { Header } from "@/components/layout/Header/Header";
import { PageSection } from "@/components/layout/PageSection/PageSection";
import { Footer } from "@/components/layout/Footer/Footer";
import { LoginForm } from "@/features/auth/LoginForm";
import { getSavedId } from "@/server/auth/session";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "Log in | Bookplate",
};

type LoginPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** Only same-origin paths may be used as a return address (no open redirect). */
function safeNext(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

/** Figma: pc_1920_ID/PW 로그인 (node 3429-36106). Submits to POST /api/auth/login. */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [savedId, params] = await Promise.all([getSavedId(), searchParams]);

  return (
    <>
      <Header />
      <main id="main">
        <PageSection soft narrow labelledBy="login-title">
          <div className={styles.inner}>
            <h1 id="login-title" className={styles.title}>
              ID / PW Login
            </h1>
            <LoginForm defaultId={savedId} redirectTo={safeNext(params.next)} />
          </div>
        </PageSection>
      </main>
      <Footer />
    </>
  );
}
