"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "@/components/ui/Icon/Icon";
import { cn } from "@/lib/cn";
import styles from "./SortSelect.module.scss";

export interface SortSelectOption<T extends string> {
  id: T;
  label: string;
}

interface SortSelectProps<T extends string> {
  value: T;
  options: readonly SortSelectOption<T>[];
  onChange: (value: T) => void;
  label?: string;
  className?: string;
}

export function SortSelect<T extends string>({ value, options, onChange, label = "Sort by", className }: SortSelectProps<T>) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLLIElement | null>>([]);
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.id === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const openAndFocus = (index: number) => {
    setOpen(true);
    requestAnimationFrame(() => optionRefs.current[index]?.focus());
  };

  const select = (next: T) => {
    setOpen(false);
    if (next !== value) onChange(next);
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openAndFocus(Math.max(0, options.findIndex((o) => o.id === value)));
    }
  };

  const onOptionKeyDown = (event: KeyboardEvent<HTMLLIElement>, index: number) => {
    const last = options.length - 1;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        optionRefs.current[index === last ? 0 : index + 1]?.focus();
        break;
      case "ArrowUp":
        event.preventDefault();
        optionRefs.current[index === 0 ? last : index - 1]?.focus();
        break;
      case "Home":
        event.preventDefault();
        optionRefs.current[0]?.focus();
        break;
      case "End":
        event.preventDefault();
        optionRefs.current[last]?.focus();
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        select(options[index].id);
        break;
      case "Escape":
      case "Tab":
        setOpen(false);
        break;
      default:
    }
  };

  return (
    <div ref={rootRef} className={cn(styles.select, className)}>
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${label}: ${current.label}`}
        onClick={() => (open ? setOpen(false) : openAndFocus(Math.max(0, options.indexOf(current))))}
        onKeyDown={onTriggerKeyDown}
      >
        <span className={styles.value}>{current.label}</span>
        <Icon name="chevronDown" size={12} strokeWidth={2} className={cn(styles.chevron, open && styles.chevronOpen)} />
      </button>

      {open ? (
        <ul id={listId} className={styles.menu} role="listbox" aria-label={label}>
          {options.map((option, index) => (
            <li
              key={option.id}
              ref={(el) => {
                optionRefs.current[index] = el;
              }}
              role="option"
              aria-selected={option.id === value}
              tabIndex={-1}
              className={cn(styles.option, option.id === value && styles.optionActive)}
              onClick={() => select(option.id)}
              onKeyDown={(e) => onOptionKeyDown(e, index)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
