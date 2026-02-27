import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { attractions } from "@/lib/db/schema";
import { scrapedAttraction } from "@/lib/validators/attractions";
import { scrapePage } from "./helpers/scrape-page";
import { slugify } from "./helpers/parser";
import { logScrapeRun } from "./helpers/log-run";
import pino from "pino";

const logger = pino({ name: "scraper:attractions" });

const PARK_PAGES = [
  {
    parkId: "usf" as const,
    url: "https://www.universalorlando.com/web/en/us/theme-parks/universal-studios-florida",
  },
  {
    parkId: "ioa" as const,
    url: "https://www.universalorlando.com/web/en/us/theme-parks/islands-of-adventure",
  },
  {
    parkId: "epic" as const,
    url: "https://www.universalorlando.com/web/en/us/theme-parks/epic-universe",
  },
];

/**
 * Scrapes attraction/ride data from each park's page.
 * Uses Firecrawl first, falls back to Playwright.
 * Parses with Cheerio in both cases.
 *
 * Returns the number of rows upserted.
 */
export async function scrapeAttractions(): Promise<number> {
  const startedAt = new Date();
  let totalRows = 0;

  try {
    for (const park of PARK_PAGES) {
      logger.info({ park: park.parkId }, "Scraping attractions for park");

      try {
        const { $ } = await scrapePage(park.url);

        // Extract attraction links from the park page
        const attractionLinks: Array<{
          name: string;
          href: string;
          image: string;
        }> = [];

        $(
          'a[href*="/things-to-do/"], a[href*="/rides/"], [class*="attraction"] a, [class*="ride"] a'
        ).each((_, el) => {
          const $el = $(el);
          const href = $el.attr("href") || "";
          const name = $el
            .find("h2, h3, h4, [class*='title'], [class*='name']")
            .first()
            .text()
            .trim();
          const image = $el.find("img").first().attr("src") || "";

          if (name && href && !attractionLinks.some((a) => a.name === name)) {
            attractionLinks.push({ name, href, image });
          }
        });

        logger.info(
          { park: park.parkId, count: attractionLinks.length },
          "Found attraction links"
        );

        // Scrape each individual attraction page
        for (const item of attractionLinks) {
          try {
            const detailUrl = item.href.startsWith("http")
              ? item.href
              : `https://www.universalorlando.com${item.href}`;

            const detail = await scrapePage(detailUrl);
            const $d = detail.$;

            // Extract detail fields
            const heightText = $d(
              '[class*="height"], [class*="requirement"]'
            )
              .first()
              .text()
              .trim();
            const expressText = $d('[class*="express"]').first().text().trim();
            const areaText = $d(
              '[class*="area"], [class*="land"], [class*="location"]'
            )
              .first()
              .text()
              .trim();
            const description =
              $d('meta[name="description"]').attr("content") ||
              $d('[class*="description"]').first().text().trim();

            // Parse height (e.g. "42 inches" → 42)
            let heightReqIn: number | undefined;
            if (heightText) {
              const match = heightText.match(/(\d+)\s*(in|inch|")/i);
              if (match) heightReqIn = parseInt(match[1], 10);
            }

            const expressEligible = expressText
              .toLowerCase()
              .includes("express");

            const slug = slugify(item.name);
            const parsed = scrapedAttraction.safeParse({
              parkId: park.parkId,
              name: item.name,
              slug,
              area: areaText || undefined,
              heightReqIn,
              expressEligible,
              description: description || undefined,
              imageUrl: item.image || undefined,
            });

            if (parsed.success) {
              totalRows += await upsertAttraction(parsed.data);
            } else {
              logger.warn(
                { name: item.name, errors: parsed.error },
                "Validation failed"
              );
            }
          } catch (err) {
            logger.warn(
              { name: item.name, err },
              "Failed to scrape attraction detail"
            );
          }
        }
      } catch (err) {
        logger.error(
          { park: park.parkId, err },
          "Failed to scrape park page"
        );
      }
    }

    await logScrapeRun({
      scraper: "attractions",
      status: totalRows > 0 ? "success" : "partial",
      rowsUpserted: totalRows,
      startedAt,
    });

    logger.info({ totalRows }, "Attractions scrape complete");
    return totalRows;
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logger.error({ error }, "Attractions scrape failed");

    await logScrapeRun({
      scraper: "attractions",
      status: "failed",
      rowsUpserted: 0,
      errorMessage: error,
      startedAt,
    });

    throw err;
  }
}

async function upsertAttraction(
  data: import("@/lib/validators/attractions").ScrapedAttraction
): Promise<number> {
  if (!process.env.DATABASE_URL) return 0;

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  await db
    .insert(attractions)
    .values({
      parkId: data.parkId,
      name: data.name,
      slug: data.slug,
      type: data.type ?? null,
      area: data.area ?? null,
      heightReqIn: data.heightReqIn ?? null,
      expressEligible: data.expressEligible ?? false,
      description: data.description ?? null,
      imageUrl: data.imageUrl ?? null,
    })
    .onConflictDoUpdate({
      target: attractions.slug,
      set: {
        name: data.name,
        type: data.type ?? null,
        area: data.area ?? null,
        heightReqIn: data.heightReqIn ?? null,
        expressEligible: data.expressEligible ?? false,
        description: data.description ?? null,
        imageUrl: data.imageUrl ?? null,
        scrapedAt: new Date(),
      },
    });

  return 1;
}
