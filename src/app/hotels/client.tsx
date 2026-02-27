"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Hotel, Star, Check } from "lucide-react";
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

const TIERS = [
  { id: "all", label: "All Tiers" },
  { id: "premier", label: "Premier" },
  { id: "preferred", label: "Preferred" },
  { id: "prime-value", label: "Prime Value" },
  { id: "value", label: "Value" },
];

export default function Client() {
  const [selectedTier, setSelectedTier] = useState("all");
  const [hotels, setHotels] = useState<HotelData[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Hotels
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            On-site hotel pricing, tiers, and included perks
          </p>
        </div>
      </div>

      {/* Tier filter */}
      <div className="flex gap-1 overflow-x-auto rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800/50">
        {TIERS.map((tier) => (
          <button
            key={tier.id}
            onClick={() => setSelectedTier(tier.id)}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              selectedTier === tier.id
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
            }`}
          >
            {tier.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-zinc-500">Loading hotels...</p>
        </div>
      ) : hotels.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Hotel className="mb-4 h-8 w-8 text-zinc-300" />
              <p className="text-sm text-zinc-500">
                No hotel data yet. Run the scraper to populate data.
              </p>
              <code className="mt-2 text-xs text-zinc-400">pnpm scrape</code>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hotels.map((hotel) => (
            <Card key={hotel.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm leading-tight">
                    {hotel.name}
                  </CardTitle>
                  {hotel.tier && (
                    <Badge
                      variant="secondary"
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
                    <p className="text-xs font-medium text-zinc-500">Included Perks</p>
                    <ul className="space-y-0.5">
                      {(hotel.perks as string[]).slice(0, 4).map((perk, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-1.5 text-xs text-zinc-600 dark:text-zinc-400"
                        >
                          <Check className="mt-0.5 h-3 w-3 shrink-0 text-green-500" />
                          {perk}
                        </li>
                      ))}
                      {(hotel.perks as string[]).length > 4 && (
                        <li className="text-xs text-zinc-400">
                          +{(hotel.perks as string[]).length - 4} more
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
