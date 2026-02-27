import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { events, eventPrices } from "@/lib/db/schema";
import { eq, gte, asc } from "drizzle-orm";

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const upcoming = searchParams.get("upcoming"); // "true" to filter future events

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { message: "Database not configured", data: [] },
      { headers: CACHE_HEADERS }
    );
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  const conditions = [];

  if (upcoming === "true") {
    const today = new Date().toISOString().split("T")[0];
    conditions.push(gte(events.endDate, today));
  }

  const data = await db
    .select()
    .from(events)
    .where(conditions.length > 0 ? conditions[0] : undefined)
    .orderBy(asc(events.startDate));

  return NextResponse.json({ data }, { headers: CACHE_HEADERS });
}
