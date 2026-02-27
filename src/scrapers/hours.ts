import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { parkHours } from "@/lib/db/schema";
import { scrapedParkHours } from "@/lib/validators/hours";
import { scrapePageWithInterception } from "./helpers/scrape-page";
import { parseTime } from "./helpers/parser";
import { logScrapeRun } from "./helpers/log-run";
import pino from "pino";

const logger = pino({ name: "scraper:hours" });

const HOURS_URL =
  "https://www.universalorlando.com/web/en/us/plan-your-visit/hours-information/park-hours";

const PARK_NAME_MAP: Record<string, "usf" | "ioa" | "epic"> = {
  "universal studios florida": "usf",
  "universal studios": "usf",
  "islands of adventure": "ioa",
  "epic universe": "epic",
};

function matchParkId(name: string): "usf" | "ioa" | "epic" | null {
  const lower = name.toLowerCase();
  for (const [key, id] of Object.entries(PARK_NAME_MAP)) {
    if (lower.includes(key)) return id;
  }
  return null;
}

/**
 * Scrapes park operating hours from Universal Orlando.
 *
 * Uses network interception (Playwright) to catch calendar API calls,
 * with Cheerio DOM parsing as fallback.
 *
 * Returns the number of rows upserted.
 */
export async function scrapeHours(): Promise<number> {
  const startedAt = new Date();
  let totalRows = 0;

  try {
    const result = await scrapePageWithInterception(HOURS_URL, [
      "hours",
      "calendar",
      "schedule",
    ]);

    // Strategy 1: Process intercepted API data
    if (result.intercepted.length > 0) {
      logger.info(
        { count: result.intercepted.length },
        "Found intercepted hours API data"
      );
      for (const { data } of result.intercepted) {
        totalRows += await processHoursAPI(data);
      }
    }

    // Strategy 2: Parse HTML
    if (totalRows === 0) {
      logger.info("No API data, parsing HTML...");
      totalRows = await parseHoursHTML(result.$);
    }

    await logScrapeRun({
      scraper: "hours",
      status: totalRows > 0 ? "success" : "partial",
      rowsUpserted: totalRows,
      startedAt,
    });

    logger.info({ totalRows }, "Hours scrape complete");
    return totalRows;
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logger.error({ error }, "Hours scrape failed");

    await logScrapeRun({
      scraper: "hours",
      status: "failed",
      rowsUpserted: 0,
      errorMessage: error,
      startedAt,
    });

    throw err;
  }
}

async function processHoursAPI(data: unknown): Promise<number> {
  if (!process.env.DATABASE_URL) return 0;
  let count = 0;

  const items = Array.isArray(data)
    ? data
    : typeof data === "object" && data !== null
      ? (data as Record<string, unknown>).dates ||
        (data as Record<string, unknown>).hours ||
        []
      : [];

  if (!Array.isArray(items)) return 0;

  for (const item of items) {
    try {
      const record = item as Record<string, unknown>;
      const parkName = String(record.parkName || record.park || "");
      const parkId = matchParkId(parkName);
      if (!parkId) continue;

      const openTime = record.openTime
        ? parseTime(String(record.openTime)) || String(record.openTime)
        : undefined;
      const closeTime = record.closeTime
        ? parseTime(String(record.closeTime)) || String(record.closeTime)
        : undefined;

      const parsed = scrapedParkHours.safeParse({
        parkId,
        date: record.date,
        openTime,
        closeTime,
        earlyEntry: record.earlyEntry
          ? parseTime(String(record.earlyEntry))
          : undefined,
        eventName: record.eventName ? String(record.eventName) : undefined,
      });

      if (parsed.success) {
        count += await upsertHours(parsed.data);
      }
    } catch (err) {
      logger.warn({ item, err }, "Failed to process hours API item");
    }
  }

  return count;
}

async function parseHoursHTML(
  $: import("cheerio").CheerioAPI
): Promise<number> {
  if (!process.env.DATABASE_URL) return 0;
  let count = 0;

  const promises: Promise<void>[] = [];

  // Look for calendar day elements with park hours
  $('[data-date], [class*="calendar-day"], [class*="schedule-day"]').each(
    (_, el) => {
      const $el = $(el);
      const date = $el.attr("data-date");
      if (!date) return;

      $el.find('[class*="park-hours"], [class*="park-entry"], [class*="park"]').each(
        (__, parkEl) => {
          const $park = $(parkEl);
          const parkName = $park
            .find('[class*="park-name"], [class*="name"]')
            .first()
            .text()
            .trim();
          const hoursText = $park
            .find('[class*="hours"], [class*="time"]')
            .first()
            .text()
            .trim();

          const parkId = matchParkId(parkName);
          if (!parkId || !hoursText) return;

          const timeMatch = hoursText.match(
            /(\d{1,2}:\d{2}\s*[AP]M)\s*[-–]\s*(\d{1,2}:\d{2}\s*[AP]M)/i
          );

          const openTime = timeMatch ? parseTime(timeMatch[1]) : null;
          const closeTime = timeMatch ? parseTime(timeMatch[2]) : null;

          const parsed = scrapedParkHours.safeParse({
            parkId,
            date,
            openTime: openTime || undefined,
            closeTime: closeTime || undefined,
          });

          if (parsed.success) {
            promises.push(
              upsertHours(parsed.data).then((n) => {
                count += n;
              })
            );
          }
        }
      );
    }
  );

  await Promise.all(promises);
  return count;
}

async function upsertHours(
  data: import("@/lib/validators/hours").ScrapedParkHours
): Promise<number> {
  if (!process.env.DATABASE_URL) return 0;

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  await db
    .insert(parkHours)
    .values({
      parkId: data.parkId,
      date: data.date,
      openTime: data.openTime ?? null,
      closeTime: data.closeTime ?? null,
      earlyEntry: data.earlyEntry ?? null,
      eventName: data.eventName ?? null,
      eventStart: data.eventStart ?? null,
      eventEnd: data.eventEnd ?? null,
    })
    .onConflictDoUpdate({
      target: [parkHours.parkId, parkHours.date],
      set: {
        openTime: data.openTime ?? null,
        closeTime: data.closeTime ?? null,
        earlyEntry: data.earlyEntry ?? null,
        eventName: data.eventName ?? null,
        scrapedAt: new Date(),
      },
    });

  return 1;
}
