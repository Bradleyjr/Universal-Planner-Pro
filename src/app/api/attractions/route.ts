import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { attractions } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const park = searchParams.get("park");
  const type = searchParams.get("type");

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { message: "Database not configured", data: [] },
      { headers: CACHE_HEADERS }
    );
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  const conditions = [];

  if (park) {
    conditions.push(eq(attractions.parkId, park));
  }
  if (type) {
    conditions.push(eq(attractions.type, type));
  }

  const data = await db
    .select()
    .from(attractions)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(attractions.name));

  return NextResponse.json({ data }, { headers: CACHE_HEADERS });
}
