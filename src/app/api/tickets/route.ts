import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { ticketPrices } from "@/lib/db/schema";
import { eq, gte, lte, and, asc } from "drizzle-orm";

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const startDate = searchParams.get("date") || new Date().toISOString().split("T")[0];
  const range = parseInt(searchParams.get("range") ?? "30", 10);
  const combo = searchParams.get("combo"); // '1-park', '2-park', '3-park'

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { message: "Database not configured", data: [] },
      { headers: CACHE_HEADERS }
    );
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);

    // Calculate end date
    const end = new Date(startDate);
    end.setDate(end.getDate() + range);
    const endDate = end.toISOString().split("T")[0];

    const conditions = [
      gte(ticketPrices.date, startDate),
      lte(ticketPrices.date, endDate),
    ];

    if (combo) {
      conditions.push(eq(ticketPrices.parkCombo, combo));
    }

    const data = await db
      .select()
      .from(ticketPrices)
      .where(and(...conditions))
      .orderBy(asc(ticketPrices.date));

    return NextResponse.json({ data }, { headers: CACHE_HEADERS });
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch ticket prices", data: [] },
      { status: 500, headers: CACHE_HEADERS }
    );
  }
}
