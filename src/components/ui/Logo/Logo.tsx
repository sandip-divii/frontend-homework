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
        {/* Lower stroke: one deep sweep from the left point up to the top-right tail.
            Upper stroke: nearly straight, crosses the tail near x≈145 and overshoots a little. */}
        <path
          d="M4 22 C 20 70, 110 72, 178 6 M4 22 C 50 38, 110 40, 164 31"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}
