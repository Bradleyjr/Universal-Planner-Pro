import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { hotels, hotelPrices } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tier = searchParams.get("tier");

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { message: "Database not configured", data: [] },
      { headers: CACHE_HEADERS }
    );
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);

    const conditions = [];
    if (tier) {
      conditions.push(eq(hotels.tier, tier));
    }

    const data = await db
      .select()
      .from(hotels)
      .where(conditions.length > 0 ? conditions[0] : undefined)
      .orderBy(asc(hotels.name));

    return NextResponse.json({ data }, { headers: CACHE_HEADERS });
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch hotels", data: [] },
      { status: 500, headers: CACHE_HEADERS }
    );
  }
}
