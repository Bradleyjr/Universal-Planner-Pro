import FirecrawlApp from "@mendable/firecrawl-js";
import pino from "pino";

const logger = pino({ name: "firecrawl" });

let client: FirecrawlApp | null = null;

function getClient(): FirecrawlApp | null {
  if (!process.env.FIRECRAWL_API_KEY) {
    logger.warn("FIRECRAWL_API_KEY not set — Firecrawl unavailable");
    return null;
  }
  if (!client) {
    client = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });
  }
  return client;
}

export interface ScrapeResult {
  html: string;
  markdown: string;
  metadata?: Record<string, unknown>;
}

/**
 * Scrape a URL using Firecrawl.
 * Returns the page HTML and markdown content.
 * Returns null if Firecrawl is unavailable or fails.
 */
export async function firecrawlScrape(
  url: string
): Promise<ScrapeResult | null> {
  const fc = getClient();
  if (!fc) return null;

  try {
    logger.info({ url }, "Scraping with Firecrawl...");

    const result = await (fc as any).scrapeUrl(url, {
      formats: ["html", "markdown"],
      waitFor: 3000,
    });

    if (!result.success) {
      logger.warn({ url, error: result.error }, "Firecrawl scrape failed");
      return null;
    }

    return {
      html: (result as any).html || "",
      markdown: (result as any).markdown || "",
      metadata: (result as any).metadata as Record<string, unknown> | undefined,
    };
  } catch (err) {
    logger.warn({ url, err }, "Firecrawl error — will fall back to Playwright");
    return null;
  }
}

/**
 * Check if Firecrawl is available (API key is set).
 */
export function isFirecrawlAvailable(): boolean {
  return !!process.env.FIRECRAWL_API_KEY;
}
