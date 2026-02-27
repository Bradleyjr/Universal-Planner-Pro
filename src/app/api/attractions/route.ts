import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const park = searchParams.get("park");
  const type = searchParams.get("type");

  // TODO: Query attractions table via Drizzle once scrapers are running
  return NextResponse.json(
    {
      message: "Attractions endpoint. Data will be available after first scrape.",
      params: { park, type },
      data: [],
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
