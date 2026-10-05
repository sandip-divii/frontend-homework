import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/ui/Icon/Icon";
import styles from "./Button.module.scss";

type Variant = "primary" | "outline" | "ghost";
type Size = "xl" | "lg" | "md";

export interface ButtonProps {
  variant?: Variant;
  size?: Size;
  /** Trailing icon (e.g. "arrowRight"). */
  icon?: IconName;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
  /** Renders a Next <Link> when provided. */
  href?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  "aria-label"?: string;
}

export function Button({
  variant = "primary",
  size = "lg",
  icon,
  fullWidth,
  className,
  children,
  href,
  type = "button",
  disabled,
  onClick,
  "aria-label": ariaLabel,
}: ButtonProps) {
  const classes = cn(styles.button, styles[variant], styles[size], fullWidth && styles.fullWidth, className);
  const content = (
    <>
      <span className={styles.label}>{children}</span>
      {icon ? <Icon name={icon} size={size === "md" ? 20 : 24} className={styles.icon} /> : null}
    </>
  );

  if (href !== undefined) {
    return (
      <Link href={href} className={classes} aria-label={ariaLabel}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled} onClick={onClick} aria-label={ariaLabel}>
      {content}
    </button>
  );
}
