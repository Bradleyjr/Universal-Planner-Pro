"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FilterGroup } from "@/components/filter-group";
import { SearchInput } from "@/components/search-input";
import { EmptyState } from "@/components/empty-state";
import { FadeIn, StaggerContainer, StaggerItem, Skeleton } from "@/components/motion";
import { Hotel, Star, Check, Search } from "lucide-react";
import { useEffect, useState } from "react";

interface HotelData {
  id: number;
  name: string;
  slug: string;
  tier: string | null;
  perks: string[] | null;
  imageUrl: string | null;
}

const TIER_LABELS: Record<string, string> = {
  premier: "Premier",
  preferred: "Preferred",
  "prime-value": "Prime Value",
  value: "Value",
};

const TIER_COLORS: Record<string, string> = {
  premier: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  preferred: "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400",
  "prime-value": "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  value: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
};

const TIER_OPTIONS = [
  { value: "all", label: "All Tiers" },
  { value: "premier", label: "Premier" },
  { value: "preferred", label: "Preferred" },
  { value: "prime-value", label: "Prime Value" },
  { value: "value", label: "Value" },
];

export default function Client() {
  const [selectedTier, setSelectedTier] = useState("all");
  const [hotels, setHotels] = useState<HotelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedTier !== "all") params.set("tier", selectedTier);

    fetch(`/api/hotels?${params}`)
      .then((r) => r.json())
      .then((json) => setHotels(json.data || []))
      .catch(() => setHotels([]))
      .finally(() => setLoading(false));
  }, [selectedTier]);

  const filtered = search
    ? hotels.filter((h) =>
        h.name.toLowerCase().includes(search.toLowerCase())
      )
    : hotels;

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-foreground">
              Hotels
            </h1>
            <p className="text-sm text-text-secondary">
              On-site hotel pricing, tiers, and included perks
            </p>
          </div>
        </div>
      </FadeIn>

      {/* Tier filter */}
      <FadeIn delay={0.05}>
        <FilterGroup
          options={TIER_OPTIONS}
          value={selectedTier}
          onChange={setSelectedTier}
          activeColor="bg-amber-500"
          layoutId="hotel-tier"
        />
      </FadeIn>

      {/* Search */}
      <FadeIn delay={0.1}>
        <SearchInput
          placeholder="Search hotels..."
          value={search}
          onChange={setSearch}
        />
      </FadeIn>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : filtered.length === 0 && hotels.length === 0 ? (
        <EmptyState
          icon={Hotel}
          iconColor="text-amber-400"
          title="No hotel data"
          description="No hotel data yet. Run the scraper to populate data."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Hotel}
          iconColor="text-amber-400"
          title="No results"
          description={`No hotels match "${search}"`}
        />
      ) : (
        <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((hotel) => (
            <StaggerItem key={hotel.id}>
              <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm leading-tight">
                      {hotel.name}
                    </CardTitle>
                    {hotel.tier && (
                      <Badge
                        variant="hotels"
                        className={`shrink-0 text-[10px] ${
                          TIER_COLORS[hotel.tier] || ""
                        }`}
                      >
                        {hotel.tier === "premier" && (
                          <Star className="mr-0.5 h-2.5 w-2.5" />
                        )}
                        {TIER_LABELS[hotel.tier] || hotel.tier}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {hotel.perks && Array.isArray(hotel.perks) && hotel.perks.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-text-secondary">Included Perks</p>
                      <ul className="space-y-0.5">
                        {(hotel.perks as string[]).slice(0, 4).map((perk, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-1.5 text-xs text-text-secondary"
                          >
                            <Check className="mt-0.5 h-3 w-3 shrink-0 text-green-500" />
                            {perk}
                          </li>
                        ))}
                        {(hotel.perks as string[]).length > 4 && (
                          <li className="text-xs text-text-secondary">
                            +{(hotel.perks as string[]).length - 4} more
                          </li>
                        )}
                      </ul>
                    </div>
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
