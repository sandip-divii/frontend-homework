const numberFormatter = new Intl.NumberFormat("ko-KR");

/** "15,000" — matches the design, which shows no currency symbol. */
export function formatPrice(value: number): string {
  return numberFormatter.format(value);
}

export function formatRating(rating: number, reviewCount: number): string {
  return `${rating.toFixed(1)} (${numberFormatter.format(reviewCount)})`;
}
