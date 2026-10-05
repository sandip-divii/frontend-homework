import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import styles from "./SectionTitle.module.scss";

interface SectionTitleProps {
  children: ReactNode;
  id?: string;
  className?: string;
}

/** "step1" frame: serif heading with a long light rule and a short accent segment. */
export function SectionTitle({ children, id, className }: SectionTitleProps) {
  return (
    <div className={cn(styles.wrap, className)}>
      <h2 id={id} className={styles.title}>
        {children}
      </h2>
      <div className={styles.rule} aria-hidden="true" />
    </div>
  );
}
