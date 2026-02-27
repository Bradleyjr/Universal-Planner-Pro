import { closeBrowser } from "./helpers/browser";
import pino from "pino";

const logger = pino({ name: "scrape-runner" });

// Import individual scrapers as they're built:
// import { scrapeTickets } from "./tickets";
// import { scrapeAttractions } from "./attractions";
// import { scrapeDining } from "./dining";
// import { scrapeHours } from "./hours";
// import { scrapeHotels } from "./hotels";

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
      status: "success",
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
  const results: ScrapeResult[] = [];

  // Add scrapers here as they're implemented:
  // results.push(await runScraper("tickets", scrapeTickets));
  // results.push(await runScraper("attractions", scrapeAttractions));
  // results.push(await runScraper("dining", scrapeDining));
  // results.push(await runScraper("hours", scrapeHours));
  // results.push(await runScraper("hotels", scrapeHotels));

  logger.info("No scrapers implemented yet — this is a skeleton run.");

  await closeBrowser();

  // Summary
  const failed = results.filter((r) => r.status === "failed");
  if (failed.length > 0) {
    logger.warn(
      { failed: failed.map((f) => f.scraper) },
      "Some scrapers failed"
    );
    process.exit(1);
  }

  logger.info(
    { totalScrapers: results.length, totalRows: results.reduce((a, r) => a + r.rowsUpserted, 0) },
    "Scrape run complete"
  );
}

main().catch((err) => {
  logger.fatal(err, "Unhandled error in scrape runner");
  process.exit(1);
});
