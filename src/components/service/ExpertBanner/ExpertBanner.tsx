import { Button } from "@/components/ui/Button/Button";
import styles from "./ExpertBanner.module.scss";

/** "con3" frame: expert registration call-to-action. Copy verbatim from Figma. */
export function ExpertBanner() {
  return (
    <section className={styles.banner} aria-labelledby="expert-banner-title">
      <div className={styles.inner}>
        <div className={styles.content}>
          <p className={styles.eyebrow}>Providing my own unique and high-quality designs by being creative</p>
          <h2 id="expert-banner-title" className={styles.title}>
            We can contribute to realizing our readers&apos; dreams.
          </h2>
          <hr className={styles.rule} />

          <p className={styles.body}>
            Through expert services, you can publish your own service products for a fee,
            <br className={styles.br} /> helping many aspiring authors with their challenges.
          </p>
          <p className={styles.callout}>
            If you are interested,
            <br /> please register as an expert and select &quot;List your expert service product&quot; after
            registration.
          </p>

          <div className={styles.actions}>
            <Button href="#" icon="arrowRight">
              Register professional
            </Button>
            <Button href="#" variant="outline">
              Uploading Professional Service Goods
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
