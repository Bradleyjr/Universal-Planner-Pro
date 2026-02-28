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
import { FilterGroup } from "@/components/filter-group";
import { SearchInput } from "@/components/search-input";
import { EmptyState } from "@/components/empty-state";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  Skeleton,
} from "@/components/motion";
import { Utensils, Search, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

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

const DINING_TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "table-service", label: "Table Service" },
  { value: "quick-service", label: "Quick Service" },
  { value: "cart", label: "Cart" },
];

export default function Client() {
  const searchParams = useSearchParams();
  const [selectedPark, setSelectedPark] = useState<ParkId>(
    () => (searchParams.get("park") as ParkId) || "all"
  );
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
    <div className="space-y-8">
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-foreground">
              Dining
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              {loading
                ? "Restaurants, quick service, and food carts"
                : `${filtered.length} restaurant${filtered.length !== 1 ? "s" : ""}, quick service, and food carts`}
            </p>
          </div>
          <ParkSelector selected={selectedPark} onChange={setSelectedPark} />
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <FilterGroup
            options={DINING_TYPE_OPTIONS}
            value={selectedType}
            onChange={setSelectedType}
            activeColor="bg-orange-500"
            layoutId="dining-type-filter"
          />
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search dining..."
            className="sm:ml-auto sm:max-w-xs"
          />
        </div>
      </FadeIn>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 && venues.length === 0 ? (
        <EmptyState
          icon={Utensils}
          iconColor="text-orange-400"
          title="No dining data yet"
          description="Run the scraper to populate data. Use: pnpm scrape"
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          iconColor="text-stone-400"
          title="No results"
          description={`No dining venues match \u201c${search}\u201d`}
        />
      ) : (
        <StaggerContainer className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((venue) => (
            <StaggerItem key={venue.id}>
              <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm leading-tight">
                      {venue.name}
                    </CardTitle>
                    {venue.type && (
                      <Badge variant="dining" className="shrink-0 text-[10px]">
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
                      <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">
                        {venue.cuisine}
                      </span>
                    )}
                    {venue.menuUrl && (
                      <a
                        href={venue.menuUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-700 hover:bg-violet-100 dark:bg-violet-900/20 dark:text-violet-400"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Menu
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </div>
  );
}
