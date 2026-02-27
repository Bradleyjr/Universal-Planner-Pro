import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { scrapeRuns } from "@/lib/db/schema";

/**
 * Log a scrape run to the database for monitoring.
 */
export async function logScrapeRun(params: {
  scraper: string;
  status: "success" | "partial" | "failed";
  rowsUpserted: number;
  errorMessage?: string;
  startedAt: Date;
}) {
  if (!process.env.DATABASE_URL) return;

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  await db.insert(scrapeRuns).values({
    scraper: params.scraper,
    status: params.status,
    rowsUpserted: params.rowsUpserted,
    errorMessage: params.errorMessage ?? null,
    startedAt: params.startedAt,
    finishedAt: new Date(),
  });
}
