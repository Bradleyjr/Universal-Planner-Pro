import { closeBrowser } from "./helpers/browser";
import { isFirecrawlAvailable } from "./helpers/firecrawl";
import { scrapeTickets } from "./tickets";
import { scrapeAttractions } from "./attractions";
import { scrapeDiningData } from "./dining";
import { scrapeHours } from "./hours";
import { scrapeHotels } from "./hotels";
import { scrapeEvents } from "./events";
import { ensureParksSeeded } from "@/lib/db/seed";
import pino from "pino";

const logger = pino({ name: "scrape-runner" });

interface ScrapeResult {
  scraper: string;
  status: "success" | "partial" | "failed";
  rowsUpserted: number;
  error?: string;
  durationMs: number;
}

async function runScraper(
  name: string,
  fn: () => Promise<number>
): Promise<ScrapeResult> {
  const start = Date.now();
  try {
    const rows = await fn();
    logger.info({ scraper: name, rows }, "Scraper completed successfully");
    return {
      scraper: name,
      status: rows > 0 ? "success" : "partial",
      rowsUpserted: rows,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logger.error({ scraper: name, error }, "Scraper failed");
    return {
      scraper: name,
      status: "failed",
      rowsUpserted: 0,
      error,
      durationMs: Date.now() - start,
    };
  }
}

async function main() {
  logger.info("Starting scrape run...");
  logger.info(
    { firecrawl: isFirecrawlAvailable() },
    "Firecrawl availability"
  );

  // Ensure parks table is seeded (safe to call repeatedly)
  await ensureParksSeeded();
  logger.info("Parks table seeded");

  const results: ScrapeResult[] = [];

  // Run scrapers sequentially to avoid overwhelming the target site
  results.push(await runScraper("tickets", scrapeTickets));
  results.push(await runScraper("attractions", scrapeAttractions));
  results.push(await runScraper("dining", scrapeDiningData));
  results.push(await runScraper("hours", scrapeHours));
  results.push(await runScraper("hotels", scrapeHotels));
  results.push(await runScraper("events", scrapeEvents));

  // Clean up browser if Playwright was used
  await closeBrowser();

  // Summary
  const succeeded = results.filter((r) => r.status === "success");
  const partial = results.filter((r) => r.status === "partial");
  const failed = results.filter((r) => r.status === "failed");
  const totalRows = results.reduce((a, r) => a + r.rowsUpserted, 0);

  logger.info(
    {
      total: results.length,
      succeeded: succeeded.length,
      partial: partial.length,
      failed: failed.length,
      totalRows,
      results: results.map((r) => ({
        scraper: r.scraper,
        status: r.status,
        rows: r.rowsUpserted,
        duration: `${(r.durationMs / 1000).toFixed(1)}s`,
      })),
    },
    "Scrape run complete"
  );

  if (failed.length > 0) {
    logger.warn(
      { failed: failed.map((f) => `${f.scraper}: ${f.error}`) },
      "Some scrapers failed"
    );
    // Exit with error if ALL scrapers failed
    if (failed.length === results.length) {
      process.exit(1);
    }
  }
}

main().catch((err) => {
  logger.fatal(err, "Unhandled error in scrape runner");
  process.exit(1);
});
