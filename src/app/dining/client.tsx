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
import { Utensils, Search, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";

interface DiningVenue {
  id: number;
  parkId: string;
  name: string;
  slug: string;
  type: string | null;
  area: string | null;
  cuisine: string | null;
  menuUrl: string | null;
  imageUrl: string | null;
}

const PARK_NAMES: Record<string, string> = {
  usf: "Universal Studios",
  ioa: "Islands of Adventure",
  epic: "Epic Universe",
};

const TYPE_LABELS: Record<string, string> = {
  "table-service": "Table Service",
  "quick-service": "Quick Service",
  cart: "Cart / Kiosk",
};

const DINING_TYPES = [
  { id: "all", label: "All" },
  { id: "table-service", label: "Table Service" },
  { id: "quick-service", label: "Quick Service" },
  { id: "cart", label: "Cart" },
];

export default function Client() {
  const [selectedPark, setSelectedPark] = useState<ParkId>("all");
  const [selectedType, setSelectedType] = useState("all");
  const [venues, setVenues] = useState<DiningVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedPark !== "all") params.set("park", selectedPark);
    if (selectedType !== "all") params.set("type", selectedType);

    fetch(`/api/dining?${params}`)
      .then((r) => r.json())
      .then((json) => setVenues(json.data || []))
      .catch(() => setVenues([]))
      .finally(() => setLoading(false));
  }, [selectedPark, selectedType]);

  const filtered = search
    ? venues.filter(
        (v) =>
          v.name.toLowerCase().includes(search.toLowerCase()) ||
          v.area?.toLowerCase().includes(search.toLowerCase()) ||
          v.cuisine?.toLowerCase().includes(search.toLowerCase())
      )
    : venues;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Dining
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {filtered.length} restaurants, quick service, and food carts
          </p>
        </div>
        <ParkSelector selected={selectedPark} onChange={setSelectedPark} />
      </div>

      {/* Type filter */}
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800/50">
          {DINING_TYPES.map((dt) => (
            <button
              key={dt.id}
              onClick={() => setSelectedType(dt.id)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedType === dt.id
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
              }`}
            >
              {dt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Search dining..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
        />
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-zinc-500">Loading dining venues...</p>
        </div>
      ) : filtered.length === 0 && venues.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Utensils className="mb-4 h-8 w-8 text-zinc-300" />
              <p className="text-sm text-zinc-500">
                No dining data yet. Run the scraper to populate data.
              </p>
              <code className="mt-2 text-xs text-zinc-400">pnpm scrape</code>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((venue) => (
            <Card key={venue.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm leading-tight">
                    {venue.name}
                  </CardTitle>
                  {venue.type && (
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      {TYPE_LABELS[venue.type] || venue.type}
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs">
                  {PARK_NAMES[venue.parkId] || venue.parkId}
                  {venue.area && ` · ${venue.area}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {venue.cuisine && (
                    <span className="rounded-md bg-orange-50 px-2 py-0.5 text-xs text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">
                      {venue.cuisine}
                    </span>
                  )}
                  {venue.menuUrl && (
                    <a
                      href={venue.menuUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 rounded-md bg-violet-50 px-2 py-0.5 text-xs text-violet-700 hover:bg-violet-100 dark:bg-violet-900/20 dark:text-violet-400"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Menu
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
