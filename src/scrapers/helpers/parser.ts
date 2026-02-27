/**
 * Slugify a string for use in URLs and database lookups.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Parse a price string like "$109.99" or "109.99" into a number.
 * Returns null if parsing fails.
 */
export function parsePrice(text: string): number | null {
  const cleaned = text.replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * Parse a time string like "9:00 AM" into 24h format "09:00".
 * Returns null if parsing fails.
 */
export function parseTime(text: string): string | null {
  const match = text.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  return `${hours.toString().padStart(2, "0")}:${minutes}`;
}
