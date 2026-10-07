"use client";

import { cn } from "@/lib/cn";
import styles from "./TextAreaField.module.scss";

interface TextAreaFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  maxLength?: number;
  rows?: number;
  className?: string;
}

export function TextAreaField({ id, name, label, value, onChange, placeholder, error, hint, maxLength, rows = 5, className }: TextAreaFieldProps) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn(styles.field, className)}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(styles.textarea, error && styles["textarea-invalid"])}
      />
      <div className={styles.meta}>
        {hint ? (
          <p id={hintId} className={styles.hint}>
            {hint}
          </p>
        ) : (
          <span />
        )}
        {maxLength ? (
          <span className={styles.count} aria-live="polite">
            {value.length} / {maxLength}
          </span>
        ) : null}
      </div>
      {error ? (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
