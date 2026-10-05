"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { Icon, type IconName } from "@/components/ui/Icon/Icon";
import { Logo } from "@/components/ui/Logo/Logo";
import { cn } from "@/lib/cn";
import styles from "./Header.module.scss";

interface NavItem {
  label: string;
  href: string;
  current?: boolean;
}

// Copy taken verbatim from the Figma "gnb_로그인후" instance.
const NAV: readonly NavItem[] = [
  { label: "Introducing North Plate Publishing.", href: "#" },
  { label: "Easy Publishing", href: "#" },
  { label: "Premium service", href: "/", current: true },
  { label: "Bookplate Bookstore", href: "#" },
  { label: "Bookplate class", href: "#" },
];

const ACTIONS: ReadonlyArray<{ icon: IconName; label: string }> = [
  { icon: "bell", label: "Notifications" },
  { icon: "user", label: "My page" },
  { icon: "cart", label: "Cart" },
  { icon: "logout", label: "Log out" },
];

export function Header() {
  const navId = useId();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Logo />

        <nav id={navId} className={cn(styles.nav, open && styles.navOpen)} aria-label="Primary">
          <ul className={styles.navList}>
            {NAV.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={cn(styles.navLink, item.current && styles.navCurrent)}
                  aria-current={item.current ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <ul className={styles.actions} aria-label="Account">
          {ACTIONS.map((action) => (
            <li key={action.icon} className={cn(action.icon === "logout" && styles.logoutItem)}>
              <button type="button" className={styles.iconBtn} aria-label={action.label}>
                <Icon name={action.icon} size={24} />
              </button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className={styles.menuBtn}
          aria-expanded={open}
          aria-controls={navId}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name={open ? "close" : "menu"} size={24} />
        </button>
      </div>
    </header>
  );
}
