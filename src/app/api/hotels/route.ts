import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const date = searchParams.get("date");

  // TODO: Query hotels + hotel_prices tables via Drizzle once scrapers are running
  return NextResponse.json(
    {
      message: "Hotels endpoint. Data will be available after first scrape.",
      params: { date },
      data: [],
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
