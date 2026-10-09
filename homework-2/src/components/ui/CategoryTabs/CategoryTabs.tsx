"use client";

import { cn } from "@/lib/cn";
import styles from "./CategoryTabs.module.scss";

export interface TabOption<T extends string> {
  id: T;
  label: string;
}

interface CategoryTabsProps<T extends string> {
  value: T;
  options: readonly TabOption<T>[];
  onChange: (value: T) => void;
  label?: string;
  className?: string;
}

/**
 * Text tabs separated by a vertical bar, as in the Figma "btn tap" frame.
 * Each bar belongs to the tab after it, so when the row wraps (phone widths) a line never starts with a bar
 * and no tab is ever cut off.
 */
export function CategoryTabs<T extends string>({ value, options, onChange, label = "Service categories", className }: CategoryTabsProps<T>) {
  return (
    <nav className={cn(styles.tabs, className)} aria-label={label}>
      <ul className={styles.list}>
        {options.map((option, index) => {
          const active = option.id === value;
          return (
            <li key={option.id} className={styles.item}>
              {index > 0 ? (
                <span className={styles.divider} aria-hidden="true">
                  |
                </span>
              ) : null}
              <button
                  type="button"
                  className={cn(styles.tab, active && styles.active)}
                  aria-pressed={active}
                  onClick={() => onChange(option.id)}
                >
                {option.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
