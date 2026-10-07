import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/Icon/Icon";
import { cn } from "@/lib/cn";
import styles from "./EmptyState.module.scss";

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  description?: string;
  /** Usually a <Button>. */
  action?: ReactNode;
  tone?: "neutral" | "error";
  className?: string;
}

export function EmptyState({ icon = "inbox", title, description, action, tone = "neutral", className }: EmptyStateProps) {
  return (
    <div className={cn(styles.empty, tone === "error" && styles.error, className)} role="status">
      <span className={styles["icon-wrap"]}>
        <Icon name={icon} size={32} />
      </span>
      <p className={styles.title}>{title}</p>
      {description ? <p className={styles.description}>{description}</p> : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
