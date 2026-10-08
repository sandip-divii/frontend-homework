import { cn } from "@/lib/cn";
import styles from "./Skeleton.module.scss";

interface SkeletonProps {
  /** Size comes from the caller's stylesheet (tokens), never from inline px. Defaults to 100% × 1em. */
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <span className={cn(styles.skeleton, className)} aria-hidden="true" />;
}
