"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ParkSelector, type ParkId } from "@/components/park-selector";
import { FerrisWheel, Search, Zap, Ruler } from "lucide-react";
import { useEffect, useState } from "react";

interface Attraction {
  id: number;
  parkId: string;
  name: string;
  slug: string;
  type: string | null;
  area: string | null;
  heightReqIn: number | null;
  expressEligible: boolean;
  description: string | null;
  imageUrl: string | null;
}

const PARK_NAMES: Record<string, string> = {
  usf: "Universal Studios",
  ioa: "Islands of Adventure",
  epic: "Epic Universe",
};

export default function AttractionsPage() {
  const [selectedPark, setSelectedPark] = useState<ParkId>("all");
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedPark !== "all") params.set("park", selectedPark);

    fetch(`/api/attractions?${params}`)
      .then((r) => r.json())
      .then((json) => setAttractions(json.data || []))
      .catch(() => setAttractions([]))
      .finally(() => setLoading(false));
  }, [selectedPark]);

  const filtered = search
    ? attractions.filter(
        (a) =>
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.area?.toLowerCase().includes(search.toLowerCase())
      )
    : attractions;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Attractions
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {filtered.length} rides, shows, and experiences
          </p>
        </div>
        <ParkSelector selected={selectedPark} onChange={setSelectedPark} />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Search attractions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
        />
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-zinc-500">Loading attractions...</p>
        </div>
      ) : filtered.length === 0 && attractions.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <FerrisWheel className="mb-4 h-8 w-8 text-zinc-300" />
              <p className="text-sm text-zinc-500">
                No attraction data yet. Run the scraper to populate data.
              </p>
              <code className="mt-2 text-xs text-zinc-400">pnpm scrape</code>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((attraction) => (
            <Card key={attraction.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm leading-tight">
                    {attraction.name}
                  </CardTitle>
                  {attraction.type && (
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      {attraction.type}
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs">
                  {PARK_NAMES[attraction.parkId] || attraction.parkId}
                  {attraction.area && ` · ${attraction.area}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {attraction.expressEligible && (
                    <div className="flex items-center gap-1 rounded-md bg-yellow-50 px-2 py-0.5 text-xs text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                      <Zap className="h-3 w-3" />
                      Express
                    </div>
                  )}
                  {attraction.heightReqIn && (
                    <div className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                      <Ruler className="h-3 w-3" />
                      {attraction.heightReqIn}&quot; min
                    </div>
                  )}
                </div>
                {attraction.description && (
                  <p className="mt-2 line-clamp-2 text-xs text-zinc-500">
                    {attraction.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
