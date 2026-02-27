"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, PartyPopper } from "lucide-react";
import { useEffect, useState } from "react";

interface EventData {
  id: number;
  name: string;
  slug: string;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "TBD";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isActive(event: EventData): boolean {
  if (!event.startDate || !event.endDate) return false;
  const today = new Date().toISOString().split("T")[0];
  return event.startDate <= today && event.endDate >= today;
}

function isUpcoming(event: EventData): boolean {
  if (!event.startDate) return false;
  const today = new Date().toISOString().split("T")[0];
  return event.startDate > today;
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "upcoming">("all");

  useEffect(() => {
    setLoading(true);
    fetch("/api/events?upcoming=true")
      .then((r) => r.json())
      .then((json) => setEvents(json.data || []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = events.filter((e) => {
    if (filter === "active") return isActive(e);
    if (filter === "upcoming") return isUpcoming(e);
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Events
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Halloween Horror Nights, Mardi Gras, Holidays, and special event pricing
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800/50">
        {[
          { id: "all" as const, label: "All Events" },
          { id: "active" as const, label: "Happening Now" },
          { id: "upcoming" as const, label: "Upcoming" },
        ].map((opt) => (
          <button
            key={opt.id}
            onClick={() => setFilter(opt.id)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === opt.id
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-zinc-500">Loading events...</p>
        </div>
      ) : filtered.length === 0 && events.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Calendar className="mb-4 h-8 w-8 text-zinc-300" />
              <p className="text-sm text-zinc-500">
                No event data yet. Run the scraper to populate data.
              </p>
              <code className="mt-2 text-xs text-zinc-400">pnpm scrape</code>
            </div>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <PartyPopper className="mb-4 h-8 w-8 text-zinc-300" />
              <p className="text-sm text-zinc-500">
                No events match this filter.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((event) => {
            const active = isActive(event);
            const upcoming = isUpcoming(event);

            return (
              <Card key={event.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{event.name}</CardTitle>
                    {active && (
                      <Badge className="shrink-0 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Happening Now
                      </Badge>
                    )}
                    {upcoming && (
                      <Badge variant="secondary" className="shrink-0">
                        Upcoming
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    {formatDate(event.startDate)} — {formatDate(event.endDate)}
                  </CardDescription>
                </CardHeader>
                {event.description && (
                  <CardContent>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {event.description}
                    </p>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
