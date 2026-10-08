const numberFormatter = new Intl.NumberFormat("en-US");

/**
 * WM "three digit comma rule": a comma between every three digits, no decimals for KRW.
 * "15,000" — the design shows no currency symbol.
 */
export function formatPrice(value: number): string {
  return numberFormatter.format(Math.round(value));
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatRating(rating: number, reviewCount: number): string {
  return `${rating.toFixed(1)} (${numberFormatter.format(reviewCount)})`;
}

interface DateFormatOptions {
  /** Format in UTC instead of the runtime's zone (used for server HTML, see LocalDateTime). */
  utc?: boolean;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function parts(iso: string, utc: boolean) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return utc
    ? { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate(), hours: d.getUTCHours(), minutes: d.getUTCMinutes() }
    : { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate(), hours: d.getHours(), minutes: d.getMinutes() };
}

/**
 * WM English date format: YYYY-MM-DD, in the time zone of the runtime that calls it.
 * In the browser that is the viewer's zone; on the server it is the server's, so render
 * viewer-facing times through `LocalDateTime` instead of calling this in a Server Component.
 */
export function formatDate(iso: string, { utc = false }: DateFormatOptions = {}): string {
  const p = parts(iso, utc);
  return p ? `${p.year}-${pad(p.month)}-${pad(p.day)}` : "";
}

/** WM English time format: AM/PM after the number → "YYYY-MM-DD h:mm AM". Same zone rule as formatDate. */
export function formatDateTime(iso: string, options: DateFormatOptions = {}): string {
  const p = parts(iso, options.utc ?? false);
  if (!p) return "";
  const period = p.hours >= 12 ? "PM" : "AM";
  const hours12 = p.hours % 12 === 0 ? 12 : p.hours % 12;
  return `${formatDate(iso, options)} ${hours12}:${pad(p.minutes)} ${period}`;
}
