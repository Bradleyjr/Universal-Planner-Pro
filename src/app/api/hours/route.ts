import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const park = searchParams.get("park");
  const month = searchParams.get("month");

  // TODO: Query park_hours table via Drizzle once scrapers are running
  return NextResponse.json(
    {
      message: "Park hours endpoint. Data will be available after first scrape.",
      params: { park, month },
      data: [],
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
