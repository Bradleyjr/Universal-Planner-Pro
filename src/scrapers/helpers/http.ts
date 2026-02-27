import * as cheerio from "cheerio";

const DEFAULT_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

/**
 * Fetch a URL and return a Cheerio instance for parsing.
 * Used for pages that return static HTML (no JS rendering needed).
 */
export async function fetchAndParse(url: string) {
  const res = await fetch(url, { headers: DEFAULT_HEADERS });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${url}`);
  }

  const html = await res.text();
  return cheerio.load(html);
}

/**
 * Fetch a URL and return the raw JSON response.
 * Used for API endpoints that return JSON directly.
 */
export async function fetchJSON<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      ...DEFAULT_HEADERS,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${url}`);
  }

  return res.json() as Promise<T>;
}
