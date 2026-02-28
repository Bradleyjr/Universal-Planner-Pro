import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { dining } from "@/lib/db/schema";
import { scrapedDining } from "@/lib/validators/dining";
import { scrapePage } from "./helpers/scrape-page";
import { slugify } from "./helpers/parser";
import { logScrapeRun } from "./helpers/log-run";
import pino from "pino";

const logger = pino({ name: "scraper:dining" });

const DINING_PAGES = [
  {
    parkId: "usf" as const,
    url: "https://www.universalorlando.com/web/en/us/theme-parks/universal-studios-florida/dining",
  },
  {
    parkId: "ioa" as const,
    url: "https://www.universalorlando.com/web/en/us/theme-parks/islands-of-adventure/dining",
  },
  {
    parkId: "epic" as const,
    url: "https://www.universalorlando.com/web/en/us/theme-parks/epic-universe/dining",
  },
];

/**
 * Scrapes dining/restaurant data from Universal Orlando.
 * Uses Firecrawl first, falls back to Playwright.
 *
 * Returns the number of rows upserted.
 */
export async function scrapeDiningData(): Promise<number> {
  const startedAt = new Date();
  let totalRows = 0;

  try {
    for (const park of DINING_PAGES) {
      logger.info({ park: park.parkId }, "Scraping dining for park");

      try {
        const { $ } = await scrapePage(park.url);

        // Extract restaurant links from listing page
        const restaurantLinks: Array<{
          name: string;
          href: string;
          image: string;
          typeText: string;
        }> = [];

        $(
          'a[href*="/dining/"], a[href*="/things-to-do/dining/"], [class*="dining"] a'
        ).each((_, el) => {
          const $el = $(el);
          const href = $el.attr("href") || "";
          const name = $el
            .find("h2, h3, h4, [class*='title'], [class*='name']")
            .first()
            .text()
            .trim();
          const image = $el.find("img").first().attr("src") || "";
          const typeText = $el
            .find("[class*='type'], [class*='category'], [class*='tag']")
            .first()
            .text()
            .trim();

          if (
            name &&
            href &&
            !restaurantLinks.some((r) => r.name === name)
          ) {
            restaurantLinks.push({ name, href, image, typeText });
          }
        });

        logger.info(
          { park: park.parkId, count: restaurantLinks.length },
          "Found restaurant links"
        );

        for (const item of restaurantLinks) {
          try {
            const detailUrl = item.href.startsWith("http")
              ? item.href
              : `https://www.universalorlando.com${item.href}`;

            const detail = await scrapePage(detailUrl);
            const $d = detail.$;

            const cuisine = $d('[class*="cuisine"], [class*="food-type"]')
              .first()
              .text()
              .trim();
            const area = $d(
              '[class*="area"], [class*="land"], [class*="location"]'
            )
              .first()
              .text()
              .trim();
            const menuUrl = $d('a[href*="menu"]').first().attr("href") || "";

            // Determine dining type
            let type: "quick-service" | "table-service" | "cart" | undefined;
            const typeStr = (item.typeText || "").toLowerCase();
            if (typeStr.includes("quick") || typeStr.includes("counter")) {
              type = "quick-service";
            } else if (
              typeStr.includes("table") ||
              typeStr.includes("full")
            ) {
              type = "table-service";
            } else if (
              typeStr.includes("cart") ||
              typeStr.includes("stand") ||
              typeStr.includes("snack")
            ) {
              type = "cart";
            }

            const slug = slugify(item.name);
            const parsed = scrapedDining.safeParse({
              parkId: park.parkId,
              name: item.name,
              slug,
              type,
              area: area || undefined,
              cuisine: cuisine || undefined,
              menuUrl: menuUrl || undefined,
              imageUrl: item.image || undefined,
            });

            if (parsed.success) {
              totalRows += await upsertDining(parsed.data);
            }
          } catch (err) {
            logger.warn(
              { name: item.name, err },
              "Failed to scrape restaurant detail"
            );
          }
        }
      } catch (err) {
        logger.error(
          { park: park.parkId, err },
          "Failed to scrape dining page"
        );
      }
    }

    await logScrapeRun({
      scraper: "dining",
      status: totalRows > 0 ? "success" : "partial",
      rowsUpserted: totalRows,
      startedAt,
    });

    logger.info({ totalRows }, "Dining scrape complete");
    return totalRows;
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logger.error({ error }, "Dining scrape failed");

    await logScrapeRun({
      scraper: "dining",
      status: "failed",
      rowsUpserted: 0,
      errorMessage: error,
      startedAt,
    });

    throw err;
  }
}

async function upsertDining(
  data: import("@/lib/validators/dining").ScrapedDining
): Promise<number> {
  if (!process.env.DATABASE_URL) return 0;

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  await db
    .insert(dining)
    .values({
      parkId: data.parkId,
      name: data.name,
      slug: data.slug,
      type: data.type ?? null,
      area: data.area ?? null,
      cuisine: data.cuisine ?? null,
      menuUrl: data.menuUrl ?? null,
      imageUrl: data.imageUrl ?? null,
    })
    .onConflictDoUpdate({
      target: dining.slug,
      set: {
        name: data.name,
        type: data.type ?? null,
        area: data.area ?? null,
        cuisine: data.cuisine ?? null,
        menuUrl: data.menuUrl ?? null,
        imageUrl: data.imageUrl ?? null,
        scrapedAt: new Date(),
      },
    });

  return 1;
}
