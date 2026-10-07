import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import styles from "./PageSection.module.scss";

interface PageSectionProps {
  children: ReactNode;
  /** Beige background (tit_big / con3 tone). */
  soft?: boolean;
  /** Caps the content at the form width (600px) instead of the 1280px container. */
  narrow?: boolean;
  labelledBy?: string;
  className?: string;
}

/** Standard page block: container width, vertical rhythm, optional soft background. */
export function PageSection({ children, soft, narrow, labelledBy, className }: PageSectionProps) {
  return (
    <section className={cn(styles.section, soft && styles.soft, className)} aria-labelledby={labelledBy}>
      <div className={cn(styles.inner, narrow && styles.narrow)}>{children}</div>
    </section>
  );
}
