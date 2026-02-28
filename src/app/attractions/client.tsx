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
import { SearchInput } from "@/components/search-input";
import { EmptyState } from "@/components/empty-state";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  Skeleton,
} from "@/components/motion";
import { FerrisWheel, Search, Zap, Ruler } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

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

export default function Client() {
  const searchParams = useSearchParams();
  const [selectedPark, setSelectedPark] = useState<ParkId>(
    () => (searchParams.get("park") as ParkId) || "all"
  );
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
    <div className="space-y-8">
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
              Attractions
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              {loading
                ? "Rides, shows, and experiences"
                : `${filtered.length} ride${filtered.length !== 1 ? "s" : ""}, shows, and experiences`}
            </p>
          </div>
          <ParkSelector selected={selectedPark} onChange={setSelectedPark} />
        </div>
      </FadeIn>

      {/* Search */}
      <FadeIn delay={0.05}>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search attractions..."
        />
      </FadeIn>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 && attractions.length === 0 ? (
        <EmptyState
          icon={FerrisWheel}
          iconColor="text-sky-400"
          title="No attraction data yet"
          description="Run the scraper to populate data. Use: pnpm scrape"
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          iconColor="text-sky-400"
          title="No results found"
          description={`No attractions match \u201c${search}\u201d`}
        />
      ) : (
        <StaggerContainer className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((attraction) => (
            <StaggerItem key={attraction.id}>
              <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm leading-tight">
                      {attraction.name}
                    </CardTitle>
                    {attraction.type && (
                      <Badge variant="attractions" className="shrink-0 text-[10px]">
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
                      <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                        <Zap className="h-3 w-3" />
                        Express
                      </div>
                    )}
                    {attraction.heightReqIn && (
                      <div className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                        <Ruler className="h-3 w-3" />
                        {attraction.heightReqIn}&quot; min
                      </div>
                    )}
                  </div>
                  {attraction.description && (
                    <p className="mt-2 line-clamp-2 text-xs text-text-secondary">
                      {attraction.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </div>
  );
}
