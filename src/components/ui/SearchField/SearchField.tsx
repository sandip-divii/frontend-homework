"use client";

import { useId, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon/Icon";
import { cn } from "@/lib/cn";
import styles from "./SearchField.module.scss";

interface SearchFieldProps {
  /** Current text in the box (controlled). */
  value: string;
  onChange: (value: string) => void;
  /** Fired on Enter / icon click with the trimmed value. */
  onSubmit: (keyword: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function SearchField({
  value,
  onChange,
  onSubmit,
  placeholder = "Please search the product / author name.",
  label = "Search services",
  className,
}: SearchFieldProps) {
  const id = useId();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(value.trim());
  };

  return (
    <form className={cn(styles.field, className)} role="search" onSubmit={submit}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type="search"
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        enterKeyHint="search"
      />
      <button type="submit" className={styles.submit} aria-label="Search">
        <Icon name="search" size={32} />
      </button>
    </form>
  );
}
