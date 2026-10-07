"use client";

import { Icon } from "@/components/ui/Icon/Icon";
import { cn } from "@/lib/cn";
import styles from "./SelectField.module.scss";

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectFieldProps<T extends string> {
  id: string;
  name: string;
  label: string;
  value: T;
  options: readonly SelectOption<T>[];
  onChange: (value: T) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
}

/** Native <select> styled like TextField (keyboard and screen-reader behaviour for free). */
export function SelectField<T extends string>({ id, name, label, value, options, onChange, error, hint, required, className }: SelectFieldProps<T>) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn(styles.field, className)}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={cn(styles.box, error && styles["box-invalid"])}>
        <select
          id={id}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={styles.select}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon name="chevronDown" size={16} className={styles.chevron} />
      </div>
      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
