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

const FILTER_OPTIONS = [
  { value: "all", label: "All Events" },
  { value: "active", label: "Happening Now" },
  { value: "upcoming", label: "Upcoming" },
];

export default function Client() {
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
    <div className="space-y-8">
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-foreground">
              Events
            </h1>
            <p className="text-sm text-text-secondary">
              Halloween Horror Nights, Mardi Gras, Holidays, and special event pricing
            </p>
          </div>
        </div>
      </FadeIn>

      {/* Filter */}
      <FadeIn delay={0.05}>
        <FilterGroup
          options={FILTER_OPTIONS}
          value={filter}
          onChange={(v) => setFilter(v as "all" | "active" | "upcoming")}
          activeColor="bg-fuchsia-500"
          layoutId="event-filter"
        />
      </FadeIn>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 && events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          iconColor="text-fuchsia-400"
          title="No event data"
          description="No event data yet. Run the scraper to populate data."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={PartyPopper}
          iconColor="text-fuchsia-300"
          title="No matching events"
          description="No events match this filter."
        />
      ) : (
        <StaggerContainer className="space-y-3">
          {filtered.map((event) => {
            const active = isActive(event);
            const upcoming = isUpcoming(event);

            return (
              <StaggerItem key={event.id}>
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">{event.name}</CardTitle>
                      {active && (
                        <Badge className="shrink-0 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
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
                      <p className="text-sm text-text-secondary">
                        {event.description}
                      </p>
                    </CardContent>
                  )}
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}
    </div>
  );
}
