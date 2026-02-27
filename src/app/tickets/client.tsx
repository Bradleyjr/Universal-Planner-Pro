"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const COMBO_LABELS: Record<string, string> = {
  "1-park": "1-Park",
  "2-park": "2-Park",
  "3-park": "3-Park",
};

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function priceColor(price: number): string {
  if (price < 120) return "text-green-600 dark:text-green-400";
  if (price < 160) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Ticket Prices
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Daily ticket pricing for Universal Orlando
          </p>
        </div>
        <div className="flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800/50">
          {Object.entries(COMBO_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setCombo(key)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                combo === key
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Ticket className="h-4 w-4 text-violet-600" />
            {COMBO_LABELS[combo] || combo} Ticket Prices — Next 30 Days
          </CardTitle>
          <CardDescription>
            Prices are scraped daily. Green = value, yellow = average, red = peak.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <p className="text-sm text-zinc-500">Loading prices...</p>
            </div>
          ) : prices.length === 0 ? (
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700">
              <div className="text-center">
                <p className="text-sm text-zinc-500">
                  No pricing data yet. Run the scraper to populate data.
                </p>
                <code className="mt-2 block text-xs text-zinc-400">
                  pnpm scrape
                </code>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7">
              {prices.map((p) => {
                const adult = parseFloat(p.adultPrice);
                const child = parseFloat(p.childPrice);
                return (
                  <div
                    key={p.id}
                    className="rounded-lg border border-zinc-200 p-2 text-center dark:border-zinc-800"
                  >
                    <p className="text-xs text-zinc-500">
                      {formatDate(p.date)}
                    </p>
                    <p className={`text-lg font-bold ${priceColor(adult)}`}>
                      ${adult.toFixed(0)}
                    </p>
                    {!isNaN(child) && child > 0 && (
                      <p className="text-[10px] text-zinc-400">
                        Child ${child.toFixed(0)}
                      </p>
                    )}
                    {p.tier && (
                      <Badge variant="secondary" className="mt-1 text-[10px]">
                        {p.tier}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
