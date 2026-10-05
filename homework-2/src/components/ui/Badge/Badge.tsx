import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import styles from "./Badge.module.scss";

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

export function Badge({ children, className }: BadgeProps) {
  return <span className={cn(styles.badge, className)}>{children}</span>;
}
