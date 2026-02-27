import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { parkHours } from "@/lib/db/schema";
import { eq, gte, lte, and, asc } from "drizzle-orm";

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const park = searchParams.get("park");
  const month = searchParams.get("month"); // YYYY-MM format

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
    conditions.push(eq(parkHours.parkId, park));
  }

  if (month) {
    // Parse YYYY-MM to start and end of month
    const startDate = `${month}-01`;
    const [year, mon] = month.split("-").map(Number);
    const endDate = new Date(year, mon, 0).toISOString().split("T")[0];
    conditions.push(gte(parkHours.date, startDate));
    conditions.push(lte(parkHours.date, endDate));
  }

  const data = await db
    .select()
    .from(parkHours)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(parkHours.date));

  return NextResponse.json({ data }, { headers: CACHE_HEADERS });
}
