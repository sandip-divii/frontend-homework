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
        {/* Upper stroke: nearly straight, runs from the left point all the way to the far right (the tail).
            Lower stroke: deep arc that rises steeply, crosses the upper line near x≈140 and stops just past it. */}
        <path
          d="M4 22 C 50 44, 120 40, 180 19 M4 22 C 20 68, 110 72, 157 14"
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
