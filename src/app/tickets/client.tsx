"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FilterGroup } from "@/components/filter-group";
import { EmptyState } from "@/components/empty-state";
import { FadeIn, StaggerContainer, StaggerItem, Skeleton } from "@/components/motion";
import { Ticket } from "lucide-react";
import { useEffect, useState } from "react";

interface TicketPrice {
  id: number;
  date: string;
  parkCombo: string;
  tier: string | null;
  adultPrice: string;
  childPrice: string;
  scrapedAt: string;
}

const COMBO_OPTIONS = [
  { value: "1-park", label: "1-Park" },
  { value: "2-park", label: "2-Park" },
  { value: "3-park", label: "3-Park" },
];

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function priceColor(price: number): string {
  if (price < 120) return "text-emerald-600 dark:text-emerald-400";
  if (price < 160) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

export default function Client() {
  const [prices, setPrices] = useState<TicketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [combo, setCombo] = useState("1-park");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/tickets?combo=${combo}&range=30`)
      .then((r) => r.json())
      .then((json) => setPrices(json.data || []))
      .catch(() => setPrices([]))
      .finally(() => setLoading(false));
  }, [combo]);

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
              Ticket Prices
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Daily ticket pricing for Universal Orlando
            </p>
          </div>
          <FilterGroup
            options={COMBO_OPTIONS}
            value={combo}
            onChange={setCombo}
            activeColor="bg-emerald-500"
          />
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Ticket className="h-4 w-4 text-emerald-500" />
              {COMBO_OPTIONS.find((o) => o.value === combo)?.label || combo} Ticket
              Prices — Next 30 Days
            </CardTitle>
            <CardDescription>
              Prices are scraped daily. Green = value, yellow = average, red = peak.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7">
                {Array.from({ length: 14 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : prices.length === 0 ? (
              <EmptyState
                icon={Ticket}
                iconColor="text-emerald-400"
                title="No pricing data yet"
                description="Run the scraper to populate ticket pricing data for Universal Orlando."
              />
            ) : (
              <StaggerContainer className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7">
                {prices.map((p) => {
                  const adult = parseFloat(p.adultPrice);
                  const child = parseFloat(p.childPrice);
                  return (
                    <StaggerItem key={p.id}>
                      <div className="rounded-2xl bg-stone-50 p-3 text-center transition-all duration-200 hover:bg-stone-100 dark:bg-stone-800/50 dark:hover:bg-stone-800">
                        <p className="text-xs font-medium text-text-secondary">
                          {formatDate(p.date)}
                        </p>
                        <p className={`text-lg font-extrabold ${priceColor(adult)}`}>
                          ${adult.toFixed(0)}
                        </p>
                        {!isNaN(child) && child > 0 && (
                          <p className="text-[10px] text-text-secondary">
                            Child ${child.toFixed(0)}
                          </p>
                        )}
                        {p.tier && (
                          <Badge variant="tickets" className="mt-1 text-[10px]">
                            {p.tier}
                          </Badge>
                        )}
                      </div>
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
