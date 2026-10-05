import Link from "next/link";
import { cn } from "@/lib/cn";
import styles from "./Logo.module.scss";

interface LogoProps {
  href?: string;
  className?: string;
}

/**
 * Approximation of the "bi" layer (북플레이트 wordmark + brush swoosh).
 * The real BI should be exported from Figma as SVG and dropped into /public.
 */
export function Logo({ href = "/", className }: LogoProps) {
  return (
    <Link href={href} className={cn(styles.logo, className)} aria-label="Bookplate — home">
      <span className={styles.word} lang="ko" aria-hidden="true">
        북플레이트
      </span>
      <svg className={styles.swoosh} viewBox="0 0 180 22" aria-hidden="true" focusable="false">
        <path d="M3 3c30 26 118 26 174 1" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </Link>
  );
}
