import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { events } from "@/lib/db/schema";
import { scrapedEvent, type ScrapedEvent } from "@/lib/validators/events";
import { scrapePage } from "./helpers/scrape-page";
import { slugify } from "./helpers/parser";
import { logScrapeRun } from "./helpers/log-run";
import pino from "pino";

const logger = pino({ name: "scraper:events" });

const EVENTS_URL =
  "https://www.universalorlando.com/web/en/us/things-to-do/events";

/**
 * Known major Universal Orlando events with approximate annual dates.
 * The scraper tries to update dates from the website, but falls back
 * to these known events to ensure they're always in the database.
 */
const KNOWN_EVENTS: Array<{
  name: string;
  description: string;
  monthRange: [number, number]; // [startMonth, endMonth] — 1-indexed
}> = [
  {
    name: "Mardi Gras",
    description:
      "Celebrate with a spectacular parade, authentic Cajun cuisine, and live concerts at Universal Studios Florida.",
    monthRange: [2, 4],
  },
  {
    name: "Halloween Horror Nights",
    description:
      "The premier Halloween event featuring terrifying haunted houses, scare zones, and live entertainment.",
    monthRange: [9, 11],
  },
  {
    name: "Holidays at Universal Orlando",
    description:
      "Experience Grinchmas, the Macy's Holiday Parade, and holiday celebrations across the parks.",
    monthRange: [11, 1],
  },
  {
    name: "Rock the Universe",
    description:
      "Florida's biggest Christian music festival featuring top contemporary Christian artists.",
    monthRange: [9, 9],
  },
];

/**
 * Scrapes event data from Universal Orlando.
 *
 * Strategy: Scrape the events listing page for current/upcoming events,
 * then supplement with known annual events. Try to extract actual dates
 * from the website when available.
 *
 * Returns the number of rows upserted.
 */
export async function scrapeEvents(): Promise<number> {
  const startedAt = new Date();
  let totalRows = 0;

  try {
    const scrapedEvents: Array<{
      name: string;
      description: string;
      startDate?: string;
      endDate?: string;
    }> = [];

    // Scrape the events page
    try {
      const { $ } = await scrapePage(EVENTS_URL);

      // Extract event cards
      $(
        'a[href*="/events/"], [class*="event"] a, [class*="Event"] a'
      ).each((_, el) => {
        const $el = $(el);
        const name = $el
          .find("h2, h3, h4, [class*='title'], [class*='name']")
          .first()
          .text()
          .trim();
        const description = $el
          .find("p, [class*='description'], [class*='desc']")
          .first()
          .text()
          .trim();
        const dateText = $el
          .find("[class*='date'], [class*='Date'], time")
          .first()
          .text()
          .trim();

        if (name && !scrapedEvents.some((e) => e.name === name)) {
          const dates = parseDateRange(dateText);
          scrapedEvents.push({
            name,
            description,
            startDate: dates?.start,
            endDate: dates?.end,
          });
        }
      });

      logger.info(
        { count: scrapedEvents.length },
        "Scraped events from listing page"
      );
    } catch (err) {
      logger.warn({ err }, "Could not scrape events page, using known events");
    }

    // Merge with known events
    const currentYear = new Date().getFullYear();
    for (const known of KNOWN_EVENTS) {
      const existing = scrapedEvents.find(
        (e) => e.name.toLowerCase().includes(known.name.toLowerCase()) ||
          known.name.toLowerCase().includes(e.name.toLowerCase())
      );

      if (existing) {
        // Scraped event found — use it but fill in description if missing
        if (!existing.description) {
          existing.description = known.description;
        }
      } else {
        // Add the known event with estimated dates for the current year
        const startMonth = known.monthRange[0];
        const endMonth = known.monthRange[1];
        const startYear =
          endMonth < startMonth ? currentYear : currentYear;
        const endYear =
          endMonth < startMonth ? currentYear + 1 : currentYear;

        scrapedEvents.push({
          name: known.name,
          description: known.description,
          startDate: `${startYear}-${String(startMonth).padStart(2, "0")}-01`,
          endDate: `${endYear}-${String(endMonth).padStart(2, "0")}-28`,
        });
      }
    }

    // Upsert all events
    for (const event of scrapedEvents) {
      const slug = slugify(event.name);

      const parsed = scrapedEvent.safeParse({
        name: event.name,
        slug,
        startDate: event.startDate,
        endDate: event.endDate,
        description: event.description || undefined,
      });

      if (parsed.success) {
        totalRows += await upsertEvent(parsed.data);
      } else {
        logger.warn({ event: event.name, errors: parsed.error }, "Validation failed");
      }
    }

    await logScrapeRun({
      scraper: "events",
      status: totalRows > 0 ? "success" : "partial",
      rowsUpserted: totalRows,
      startedAt,
    });

    logger.info({ totalRows }, "Events scrape complete");
    return totalRows;
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logger.error({ error }, "Events scrape failed");

    await logScrapeRun({
      scraper: "events",
      status: "failed",
      rowsUpserted: 0,
      errorMessage: error,
      startedAt,
    });

    throw err;
  }
}

/**
 * Try to parse a date range string like "Feb 1 - Apr 10, 2026" or
 * "September 5 - November 1". Returns start/end in YYYY-MM-DD format.
 */
function parseDateRange(
  text: string
): { start: string; end: string } | null {
  if (!text) return null;

  const months: Record<string, string> = {
    jan: "01", january: "01",
    feb: "02", february: "02",
    mar: "03", march: "03",
    apr: "04", april: "04",
    may: "05",
    jun: "06", june: "06",
    jul: "07", july: "07",
    aug: "08", august: "08",
    sep: "09", september: "09",
    oct: "10", october: "10",
    nov: "11", november: "11",
    dec: "12", december: "12",
  };

  // Match patterns like "Feb 1 - Apr 10, 2026"
  const rangeMatch = text.match(
    /(\w+)\s+(\d{1,2})\s*[-–]\s*(\w+)\s+(\d{1,2})(?:,?\s*(\d{4}))?/i
  );
  if (rangeMatch) {
    const startMonth = months[rangeMatch[1].toLowerCase()];
    const startDay = rangeMatch[2].padStart(2, "0");
    const endMonth = months[rangeMatch[3].toLowerCase()];
    const endDay = rangeMatch[4].padStart(2, "0");
    const year = rangeMatch[5] || String(new Date().getFullYear());

    if (startMonth && endMonth) {
      return {
        start: `${year}-${startMonth}-${startDay}`,
        end: `${year}-${endMonth}-${endDay}`,
      };
    }
  }

  return null;
}

async function upsertEvent(data: ScrapedEvent): Promise<number> {
  if (!process.env.DATABASE_URL) return 0;

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  await db
    .insert(events)
    .values({
      name: data.name,
      slug: data.slug,
      startDate: data.startDate ?? null,
      endDate: data.endDate ?? null,
      description: data.description ?? null,
    })
    .onConflictDoUpdate({
      target: events.slug,
      set: {
        name: data.name,
        startDate: data.startDate ?? null,
        endDate: data.endDate ?? null,
        description: data.description ?? null,
        scrapedAt: new Date(),
      },
    });

  return 1;
}
