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

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** WM English date format: YYYY-MM-DD (local time). */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** WM English time format: AM/PM after the number → "YYYY-MM-DD h:mm AM". */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const hours24 = d.getHours();
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${formatDate(iso)} ${hours12}:${pad(d.getMinutes())} ${period}`;
}
