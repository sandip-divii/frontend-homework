"use client";

import { Fragment } from "react";
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

/** Text tabs separated by a vertical bar, as in the Figma "btn tap" frame. */
export function CategoryTabs<T extends string>({ value, options, onChange, label = "Service categories", className }: CategoryTabsProps<T>) {
  return (
    <nav className={cn(styles.tabs, className)} aria-label={label}>
      <ul className={styles.list}>
        {options.map((option, index) => {
          const active = option.id === value;
          return (
            <Fragment key={option.id}>
              {index > 0 ? (
                <li className={styles.divider} aria-hidden="true">
                  |
                </li>
              ) : null}
              <li>
                <button
                  type="button"
                  className={cn(styles.tab, active && styles.active)}
                  aria-pressed={active}
                  onClick={() => onChange(option.id)}
                >
                  {option.label}
                </button>
              </li>
            </Fragment>
          );
        })}
      </ul>
    </nav>
  );
}
