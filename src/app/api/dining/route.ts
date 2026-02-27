import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { dining } from "@/lib/db/schema";
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

  try {
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);

    const conditions = [];

    if (park) {
      conditions.push(eq(dining.parkId, park));
    }
    if (type) {
      conditions.push(eq(dining.type, type));
    }

    const data = await db
      .select()
      .from(dining)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(dining.name));

    return NextResponse.json({ data }, { headers: CACHE_HEADERS });
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch dining", data: [] },
      { status: 500, headers: CACHE_HEADERS }
    );
  }
}
