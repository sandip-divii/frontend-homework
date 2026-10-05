"use client";

import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon/Icon";
import { cn } from "@/lib/cn";
import styles from "./Checkbox.module.scss";

interface CheckboxProps {
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  className?: string;
}

/** 30px square checkbox with a check mark ("check_box" asset in Figma). */
export function Checkbox({ name, checked, onChange, children, className }: CheckboxProps) {
  return (
    <label className={cn(styles.checkbox, className)}>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className={styles.input}
      />
      <span className={styles.box} aria-hidden="true">
        <Icon name="check" size={18} strokeWidth={2} className={styles.mark} />
      </span>
      <span className={styles.label}>{children}</span>
    </label>
  );
}
