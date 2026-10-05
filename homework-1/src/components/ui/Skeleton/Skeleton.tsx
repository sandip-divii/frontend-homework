import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import styles from "./Skeleton.module.scss";

interface SkeletonProps {
  /** CSS width (e.g. "60%" or "120px"). Defaults to 100%. */
  width?: string;
  /** CSS height. Defaults to 1em. */
  height?: string;
  className?: string;
}

export function Skeleton({ width, height, className }: SkeletonProps) {
  const style: CSSProperties = { width, height };
  return <span className={cn(styles.skeleton, className)} style={style} aria-hidden="true" />;
}
