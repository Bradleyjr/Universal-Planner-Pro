import * as cheerio from "cheerio";
import { firecrawlScrape } from "./firecrawl";
import { getBrowser } from "./browser";
import pino from "pino";

const logger = pino({ name: "scrape-page" });

export interface PageData {
  /** Cheerio instance for parsing HTML */
  $: cheerio.CheerioAPI;
  /** Raw HTML content */
  html: string;
  /** Markdown content (only from Firecrawl) */
  markdown: string;
  /** Which method was used */
  method: "firecrawl" | "playwright";
}

/**
 * Fetch and parse a page using Firecrawl first, falling back to Playwright.
 *
 * This is the primary entry point for all scrapers. It returns a Cheerio
 * instance for HTML parsing regardless of which method was used.
 */
export async function scrapePage(url: string): Promise<PageData> {
  // Try Firecrawl first
  const fcResult = await firecrawlScrape(url);

  if (fcResult && fcResult.html) {
    logger.info({ url, method: "firecrawl" }, "Page scraped successfully");
    return {
      $: cheerio.load(fcResult.html),
      html: fcResult.html,
      markdown: fcResult.markdown,
      method: "firecrawl",
    };
  }

  // Fall back to Playwright
  logger.info({ url }, "Falling back to Playwright...");
  const browser = await getBrowser();
  const context = await (browser as any).newContext();
  const page = await (context as any).newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(2000);

    const html = await page.content();
    await page.close();
    await context.close();

    logger.info({ url, method: "playwright" }, "Page scraped successfully");
    return {
      $: cheerio.load(html),
      html,
      markdown: "",
      method: "playwright",
    };
  } catch (err) {
    await page.close().catch(() => {});
    await context.close().catch(() => {});
    throw err;
  }
}

/**
 * Scrape a page and also intercept API responses (Playwright only).
 * Useful for pages that load data via XHR/fetch calls.
 *
 * Falls back to plain scrapePage if Firecrawl is used (no interception possible).
 */
export async function scrapePageWithInterception(
  url: string,
  urlPatterns: string[]
): Promise<PageData & { intercepted: Array<{ url: string; data: unknown }> }> {
  // Firecrawl can't intercept network requests, so go straight to Playwright
  // if we need interception
  const browser = await getBrowser();
  const context = await (browser as any).newContext();
  const page = await (context as any).newPage();
  const intercepted: Array<{ url: string; data: unknown }> = [];

  try {
    await page.route("**/*", async (route: any) => {
      const reqUrl: string = route.request().url();
      const shouldIntercept = urlPatterns.some((pattern) =>
        reqUrl.includes(pattern)
      );

      if (shouldIntercept) {
        try {
          const response = await route.fetch();
          const json = await response.json();
          intercepted.push({ url: reqUrl, data: json });
          logger.info({ url: reqUrl }, "Intercepted API call");
          await route.fulfill({ response });
        } catch {
          await route.continue();
        }
      } else {
        await route.continue();
      }
    });

    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(3000);

    const html = await page.content();
    await page.close();
    await context.close();

    return {
      $: cheerio.load(html),
      html,
      markdown: "",
      method: "playwright",
      intercepted,
    };
  } catch (err) {
    await page.close().catch(() => {});
    await context.close().catch(() => {});
    throw err;
  }
}
