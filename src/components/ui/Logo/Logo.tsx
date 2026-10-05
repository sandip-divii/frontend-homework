import Link from "next/link";
import { cn } from "@/lib/cn";
import styles from "./Logo.module.scss";

interface LogoProps {
  href?: string;
  className?: string;
}

/**
 * Approximation of the "bi" layer (북플레이트 wordmark + brush swoosh).
 * The swoosh is a crescent: a deep lower arc and a shallow upper arc that meet in a
 * point on the left and converge on the right into a thin tail flicking up past the text.
 * The real BI should be exported from Figma as SVG and dropped into /public.
 */
export function Logo({ href = "/", className }: LogoProps) {
  return (
    <Link href={href} className={cn(styles.logo, className)} aria-label="Bookplate — home">
      <span className={styles.word} lang="ko" aria-hidden="true">
        북플레이트
      </span>
      <svg className={styles.swoosh} viewBox="0 0 180 60" aria-hidden="true" focusable="false">
        <path
          d="M8 27 C 30 62, 110 66, 150 31 C 158 24, 168 15, 178 8 M8 27 C 40 50, 110 52, 150 31"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}
