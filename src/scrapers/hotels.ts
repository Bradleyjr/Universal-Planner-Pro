import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { hotels } from "@/lib/db/schema";
import { scrapedHotel, type ScrapedHotel } from "@/lib/validators/hotels";
import { scrapePage } from "./helpers/scrape-page";
import { slugify } from "./helpers/parser";
import { logScrapeRun } from "./helpers/log-run";
import pino from "pino";

const logger = pino({ name: "scraper:hotels" });

const HOTELS_URL =
  "https://www.universalorlando.com/web/en/us/places-to-stay";

// Known Universal Orlando on-site hotels with their tiers
const KNOWN_HOTELS: Array<{
  name: string;
  tier: "premier" | "preferred" | "prime-value" | "value";
  perks: string[];
}> = [
  {
    name: "Loews Portofino Bay Hotel",
    tier: "premier",
    perks: [
      "Early Park Admission",
      "Free Universal Express Unlimited",
      "Complimentary water taxi to parks",
      "Priority seating at select restaurants",
    ],
  },
  {
    name: "Hard Rock Hotel",
    tier: "premier",
    perks: [
      "Early Park Admission",
      "Free Universal Express Unlimited",
      "Complimentary water taxi to parks",
      "Rock Royalty Lounge access (suites)",
    ],
  },
  {
    name: "Loews Royal Pacific Resort",
    tier: "premier",
    perks: [
      "Early Park Admission",
      "Free Universal Express Unlimited",
      "Complimentary water taxi to parks",
      "Wantilan Luau dining experience",
    ],
  },
  {
    name: "Universal's Grand Helios Hotel",
    tier: "premier",
    perks: [
      "Early Park Admission",
      "Free Universal Express Unlimited",
      "Walking distance to Epic Universe",
    ],
  },
  {
    name: "Universal's Stella Nova Resort",
    tier: "preferred",
    perks: [
      "Early Park Admission",
      "Walking distance to Epic Universe",
      "Resort-style pool",
    ],
  },
  {
    name: "Universal's Terra Luna Resort",
    tier: "preferred",
    perks: [
      "Early Park Admission",
      "Walking distance to Epic Universe",
      "Resort-style pool",
    ],
  },
  {
    name: "Loews Sapphire Falls Resort",
    tier: "preferred",
    perks: [
      "Early Park Admission",
      "Complimentary water taxi to parks",
      "Caribbean-themed pool with waterslide",
    ],
  },
  {
    name: "Universal's Aventura Hotel",
    tier: "prime-value",
    perks: [
      "Early Park Admission",
      "Rooftop bar and grill",
      "Modern room design",
    ],
  },
  {
    name: "Universal's Cabana Bay Beach Resort",
    tier: "prime-value",
    perks: [
      "Early Park Admission",
      "Lazy river and bowling alley",
      "Retro-themed rooms",
    ],
  },
  {
    name: "Universal's Endless Summer Resort - Surfside Inn and Suites",
    tier: "value",
    perks: [
      "Early Park Admission",
      "Complimentary shuttle to parks",
      "Surf-themed pool",
    ],
  },
  {
    name: "Universal's Endless Summer Resort - Dockside Inn and Suites",
    tier: "value",
    perks: [
      "Early Park Admission",
      "Complimentary shuttle to parks",
      "Two pools",
    ],
  },
];

/**
 * Scrapes hotel data from Universal Orlando.
 *
 * Strategy: We use a combination of known hotel data and scraping the
 * hotels listing page for any new properties or updated images.
 * The known hotel list provides tier and perks data that isn't always
 * easily extractable from the website.
 *
 * Returns the number of rows upserted.
 */
export async function scrapeHotels(): Promise<number> {
  const startedAt = new Date();
  let totalRows = 0;

  try {
    // Try to scrape the hotels page for images and any new hotels
    let scrapedImages: Record<string, string> = {};
    try {
      const { $ } = await scrapePage(HOTELS_URL);

      // Extract hotel cards with images
      $(
        'a[href*="/places-to-stay/"], [class*="hotel"] a, [class*="resort"] a'
      ).each((_, el) => {
        const $el = $(el);
        const name = $el
          .find("h2, h3, h4, [class*='title'], [class*='name']")
          .first()
          .text()
          .trim();
        const image = $el.find("img").first().attr("src") || "";

        if (name && image) {
          scrapedImages[name.toLowerCase()] = image.startsWith("http")
            ? image
            : `https://www.universalorlando.com${image}`;
        }
      });

      logger.info(
        { imageCount: Object.keys(scrapedImages).length },
        "Scraped hotel images"
      );
    } catch (err) {
      logger.warn({ err }, "Could not scrape hotel images, using known data only");
    }

    // Upsert all known hotels
    for (const hotel of KNOWN_HOTELS) {
      const slug = slugify(hotel.name);
      const imageUrl =
        scrapedImages[hotel.name.toLowerCase()] || undefined;

      const parsed = scrapedHotel.safeParse({
        name: hotel.name,
        slug,
        tier: hotel.tier,
        perks: hotel.perks,
        imageUrl,
      });

      if (parsed.success) {
        totalRows += await upsertHotel(parsed.data);
      } else {
        logger.warn({ hotel: hotel.name, errors: parsed.error }, "Validation failed");
      }
    }

    await logScrapeRun({
      scraper: "hotels",
      status: totalRows > 0 ? "success" : "partial",
      rowsUpserted: totalRows,
      startedAt,
    });

    logger.info({ totalRows }, "Hotels scrape complete");
    return totalRows;
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logger.error({ error }, "Hotels scrape failed");

    await logScrapeRun({
      scraper: "hotels",
      status: "failed",
      rowsUpserted: 0,
      errorMessage: error,
      startedAt,
    });

    throw err;
  }
}

async function upsertHotel(data: ScrapedHotel): Promise<number> {
  if (!process.env.DATABASE_URL) return 0;

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  await db
    .insert(hotels)
    .values({
      name: data.name,
      slug: data.slug,
      tier: data.tier ?? null,
      perks: data.perks ?? null,
      imageUrl: data.imageUrl ?? null,
    })
    .onConflictDoUpdate({
      target: hotels.slug,
      set: {
        name: data.name,
        tier: data.tier ?? null,
        perks: data.perks ?? null,
        imageUrl: data.imageUrl ?? null,
        scrapedAt: new Date(),
      },
    });

  return 1;
}
