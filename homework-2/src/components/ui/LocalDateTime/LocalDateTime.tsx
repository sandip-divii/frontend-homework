"use client";

import { useSyncExternalStore } from "react";
import { formatDateTime } from "@/lib/format";

interface LocalDateTimeProps {
  /** ISO 8601 timestamp from the API (UTC). */
  iso: string;
}

const subscribe = () => () => {};

/**
 * WM date-time in the viewer's time zone. The server does not know that zone, so the HTML
 * carries the UTC value and the browser swaps in the local one on hydration without a mismatch.
 */
export function LocalDateTime({ iso }: LocalDateTimeProps) {
  const text = useSyncExternalStore(
    subscribe,
    () => formatDateTime(iso),
    () => formatDateTime(iso, { utc: true }),
  );
  return <time dateTime={iso}>{text}</time>;
}
