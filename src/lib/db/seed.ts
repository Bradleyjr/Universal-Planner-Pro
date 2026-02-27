import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { parks } from "./schema";

/**
 * Seeds the parks table with the three Universal Orlando parks.
 * Run with: tsx src/lib/db/seed.ts
 */
async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  const parkData = [
    { id: "usf", name: "Universal Studios Florida", slug: "universal-studios-florida" },
    { id: "ioa", name: "Islands of Adventure", slug: "islands-of-adventure" },
    { id: "epic", name: "Epic Universe", slug: "epic-universe" },
  ];

  for (const park of parkData) {
    await db.insert(parks).values(park).onConflictDoNothing();
  }

  console.log("Seeded parks table with 3 parks");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
