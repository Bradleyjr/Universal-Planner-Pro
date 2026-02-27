import { NextRequest, NextResponse } from "next/server";
import { fetchWaitTimes } from "@/scrapers/wait-times";

// Short cache — wait times change frequently
const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const park = searchParams.get("park");

  try {
    let data = await fetchWaitTimes();

    if (park) {
      data = data.filter((d) => d.parkId === park);
    }

    return NextResponse.json({ data }, { headers: CACHE_HEADERS });
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch wait times", data: [] },
      { status: 500, headers: CACHE_HEADERS }
    );
  }
}
