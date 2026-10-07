"use client";

import type { HTMLInputAutoCompleteAttribute, ReactNode } from "react";
import { cn } from "@/lib/cn";
import styles from "./TextField.module.scss";

interface TextFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "password" | "email";
  placeholder?: string;
  /** Validation message; also sets aria-invalid and aria-describedby. */
  error?: string;
  autoComplete?: HTMLInputAutoCompleteAttribute;
  /** Control rendered inside the box on the right (e.g. show/hide password). */
  trailing?: ReactNode;
  required?: boolean;
  className?: string;
}

/** Labelled input from the login frame: 60px box, 1px line1 border, 12px error line below. */
export function TextField({
  id,
  name,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  error,
  autoComplete,
  trailing,
  required,
  className,
}: TextFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className={cn(styles.field, className)}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={cn(styles.box, error && styles["box-invalid"])}>
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={styles.input}
        />
        {trailing ? <div className={styles.trailing}>{trailing}</div> : null}
      </div>
      {error ? (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
