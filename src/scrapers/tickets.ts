import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { ticketPrices } from "@/lib/db/schema";
import { scrapedTicketPrice } from "@/lib/validators/tickets";
import { scrapePageWithInterception, scrapePage } from "./helpers/scrape-page";
import { parsePrice } from "./helpers/parser";
import { logScrapeRun } from "./helpers/log-run";
import pino from "pino";

const logger = pino({ name: "scraper:tickets" });

const TICKETS_URL =
  "https://www.universalorlando.com/web/en/us/tickets-packages/park-tickets";

/**
 * Scrapes daily ticket pricing from Universal Orlando.
 *
 * Strategy:
 * 1. Try scraping with network interception to catch pricing API calls
 * 2. If API data found, parse it directly (most reliable)
 * 3. If no API data, parse the HTML DOM with Cheerio
 *
 * Returns the number of rows upserted.
 */
export async function scrapeTickets(): Promise<number> {
  const startedAt = new Date();
  let rowsUpserted = 0;

  try {
    // Try with network interception first (Playwright path) to catch API calls
    const result = await scrapePageWithInterception(TICKETS_URL, [
      "pricing",
      "ticket",
      "calendar",
      "/api/",
    ]);

    // Strategy 1: Use intercepted API data if available
    if (result.intercepted.length > 0) {
      logger.info(
        { count: result.intercepted.length },
        "Found intercepted pricing API data"
      );
      for (const { data } of result.intercepted) {
        rowsUpserted += await processInterceptedData(data);
      }
    }

    // Strategy 2: Parse HTML with Cheerio
    if (rowsUpserted === 0) {
      logger.info("No API data intercepted, parsing HTML...");
      rowsUpserted = await parseTicketHTML(result.$);
    }

    await logScrapeRun({
      scraper: "tickets",
      status: rowsUpserted > 0 ? "success" : "partial",
      rowsUpserted,
      startedAt,
    });

    logger.info({ rowsUpserted }, "Ticket scrape complete");
    return rowsUpserted;
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logger.error({ error }, "Ticket scrape failed");

    await logScrapeRun({
      scraper: "tickets",
      status: "failed",
      rowsUpserted: 0,
      errorMessage: error,
      startedAt,
    });

    throw err;
  }
}

/**
 * Process intercepted API data for ticket pricing.
 */
async function processInterceptedData(data: unknown): Promise<number> {
  if (!process.env.DATABASE_URL) return 0;

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);
  let count = 0;

  const items = Array.isArray(data)
    ? data
    : typeof data === "object" && data !== null
      ? [data]
      : [];

  for (const item of items) {
    try {
      const record = item as Record<string, unknown>;
      if (!record.date) continue;

      const parsed = scrapedTicketPrice.safeParse({
        date: record.date,
        parkCombo: record.parkCombo || record.type || "1-park",
        tier: record.tier,
        adultPrice: Number(record.adultPrice || record.price),
        childPrice: Number(record.childPrice || record.adultPrice || record.price),
      });

      if (parsed.success) {
        await db
          .insert(ticketPrices)
          .values({
            date: parsed.data.date,
            parkCombo: parsed.data.parkCombo,
            tier: parsed.data.tier ?? null,
            adultPrice: parsed.data.adultPrice.toFixed(2),
            childPrice: parsed.data.childPrice.toFixed(2),
          })
          .onConflictDoUpdate({
            target: [ticketPrices.date, ticketPrices.parkCombo, ticketPrices.tier],
            set: {
              adultPrice: parsed.data.adultPrice.toFixed(2),
              childPrice: parsed.data.childPrice.toFixed(2),
              scrapedAt: new Date(),
            },
          });
        count++;
      }
    } catch (err) {
      logger.warn({ err }, "Failed to process intercepted ticket data");
    }
  }

  return count;
}

/**
 * Parse ticket pricing from HTML using Cheerio.
 * Selectors will need refinement after inspecting the actual page structure.
 */
async function parseTicketHTML(
  $: import("cheerio").CheerioAPI
): Promise<number> {
  if (!process.env.DATABASE_URL) return 0;

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  // Collect upsert promises since we can't await inside .each()
  const upsertPromises: Promise<void>[] = [];

  // Look for calendar day elements with pricing data
  $('[data-date], [data-price], [class*="calendar-day"]').each((_, el) => {
    const $el = $(el);
    const date = $el.attr("data-date") || $el.attr("data-day");
    const priceText =
      $el.attr("data-price") ||
      $el.find('[class*="price"]').first().text().trim();

    if (date && priceText) {
      const price = parsePrice(priceText);
      if (price) {
        const parsed = scrapedTicketPrice.safeParse({
          date,
          parkCombo: "1-park",
          adultPrice: price,
          childPrice: price,
        });

        if (parsed.success) {
          upsertPromises.push(
            db.insert(ticketPrices)
              .values({
                date: parsed.data.date,
                parkCombo: parsed.data.parkCombo,
                tier: parsed.data.tier ?? null,
                adultPrice: parsed.data.adultPrice.toFixed(2),
                childPrice: parsed.data.childPrice.toFixed(2),
              })
              .onConflictDoUpdate({
                target: [ticketPrices.date, ticketPrices.parkCombo, ticketPrices.tier],
                set: {
                  adultPrice: parsed.data.adultPrice.toFixed(2),
                  childPrice: parsed.data.childPrice.toFixed(2),
                  scrapedAt: new Date(),
                },
              })
              .then(() => {})
              .catch((err) =>
                logger.warn({ date, err }, "Failed to upsert ticket price")
              )
          );
        }
      }
    }
  });

  // Wait for all DB writes to complete before returning count
  await Promise.all(upsertPromises);
  return upsertPromises.length;
}
