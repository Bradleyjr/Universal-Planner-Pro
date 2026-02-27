import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const date = searchParams.get("date");
  const range = searchParams.get("range") ?? "30";

  // TODO: Query ticket_prices table via Drizzle once scrapers are running
  return NextResponse.json(
    {
      message: "Ticket pricing endpoint. Data will be available after first scrape.",
      params: { date, range: parseInt(range, 10) },
      data: [],
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
