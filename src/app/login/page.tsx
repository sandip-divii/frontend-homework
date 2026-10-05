import type { Metadata } from "next";
import { Header } from "@/components/layout/Header/Header";
import { Footer } from "@/components/layout/Footer/Footer";
import { LoginForm } from "@/features/auth/LoginForm";
import { getSavedId } from "@/lib/auth/session";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "Log in | Bookplate",
};

/** Figma: pc_1920_ID/PW 로그인 (node 3429-36106). */
export default async function LoginPage() {
  const savedId = await getSavedId();

  return (
    <>
      <Header />
      <main id="main">
        <section className={styles.section} aria-labelledby="login-title">
          <div className={styles.inner}>
            <h1 id="login-title" className={styles.title}>
              ID / PW Login
            </h1>
            <LoginForm defaultId={savedId} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
