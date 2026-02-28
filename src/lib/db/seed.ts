import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { parks } from "./schema";

const PARK_DATA = [
  { id: "usf", name: "Universal Studios Florida", slug: "universal-studios-florida" },
  { id: "ioa", name: "Islands of Adventure", slug: "islands-of-adventure" },
  { id: "epic", name: "Epic Universe", slug: "epic-universe" },
];

/**
 * Ensures the parks table has all 3 Universal Orlando parks.
 * Uses onConflictDoNothing so it's safe to call repeatedly.
 */
export async function ensureParksSeeded(): Promise<void> {
  if (!process.env.DATABASE_URL) return;

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  for (const park of PARK_DATA) {
    await db.insert(parks).values(park).onConflictDoNothing();
  }
}

/**
 * CLI entrypoint: tsx src/lib/db/seed.ts
 */
async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  await ensureParksSeeded();
  console.log("Seeded parks table with 3 parks");
}

// Only run when executed directly (not imported)
if (process.argv[1]?.includes("seed")) {
  main().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
}
