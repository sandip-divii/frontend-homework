"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Icon } from "@/components/ui/Icon/Icon";
import { Logo } from "@/components/ui/Logo/Logo";
import { cn } from "@/lib/cn";
import { logout } from "@/services/auth";
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

export interface HeaderViewProps {
  /** Signed-in user's display name; undefined when logged out. */
  userName?: string;
}

/**
 * Account icons:
 * - logged in  → bell · my page · cart · log out   (Figma "gnb_로그인후")
 * - logged out → my page (→ /login) · log in        (no Figma frame; see docs/DESIGN-CHECK.md)
 */
export function HeaderView({ userName }: HeaderViewProps) {
  const navId = useId();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const loggedIn = userName !== undefined;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const onLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      router.push("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Logo />

        <nav id={navId} className={cn(styles.nav, open && styles["nav-open"])} aria-label="Primary">
          <ul className={styles["nav-list"]}>
            {NAV.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={cn(styles["nav-link"], item.current && styles["nav-current"])}
                  aria-current={item.current ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <ul className={styles.actions} aria-label="Account" data-auth={loggedIn ? "in" : "out"}>
          {loggedIn ? (
            <>
              <li>
                <button type="button" className={styles["icon-btn"]} aria-label="Notifications">
                  <Icon name="bell" size={24} />
                </button>
              </li>
              <li>
                <button type="button" className={styles["icon-btn"]} aria-label={`My page (${userName})`}>
                  <Icon name="user" size={24} />
                </button>
              </li>
              <li>
                <button type="button" className={styles["icon-btn"]} aria-label="Cart">
                  <Icon name="cart" size={24} />
                </button>
              </li>
              <li className={styles["logout-item"]}>
                <button type="button" className={styles["icon-btn"]} aria-label="Log out" onClick={onLogout} disabled={loggingOut}>
                  <Icon name="logout" size={24} />
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link href="/login" className={styles["icon-btn"]} aria-label="My page — log in required">
                  <Icon name="user" size={24} />
                </Link>
              </li>
              <li>
                <Link href="/login" className={styles["icon-btn"]} aria-label="Log in">
                  <Icon name="login" size={24} />
                </Link>
              </li>
            </>
          )}
        </ul>

        <button
          type="button"
          className={styles["menu-btn"]}
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
