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
import { FadeIn, StaggerContainer, StaggerItem, Skeleton } from "@/components/motion";
import { Timer, CircleDot } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";

interface WaitTime {
  parkId: string;
  rideName: string;
  land: string;
  isOpen: boolean;
  waitMinutes: number;
  lastUpdated: string;
}

const PARK_NAMES: Record<string, string> = {
  usf: "Universal Studios",
  ioa: "Islands of Adventure",
  epic: "Epic Universe",
};

function waitColor(minutes: number): string {
  if (minutes <= 15) return "text-green-600 dark:text-green-400";
  if (minutes <= 45) return "text-yellow-600 dark:text-yellow-400";
  if (minutes <= 75) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

function waitBg(minutes: number): string {
  if (minutes <= 15) return "bg-green-50 dark:bg-green-900/20";
  if (minutes <= 45) return "bg-yellow-50 dark:bg-yellow-900/20";
  if (minutes <= 75) return "bg-orange-50 dark:bg-orange-900/20";
  return "bg-red-50 dark:bg-red-900/20";
}

type SortOption = "wait-desc" | "wait-asc" | "name";

export default function Client() {
  const searchParams = useSearchParams();
  const [selectedPark, setSelectedPark] = useState<ParkId>(
    () => (searchParams.get("park") as ParkId) || "all"
  );
  const [waitTimes, setWaitTimes] = useState<WaitTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("wait-desc");
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedPark !== "all") params.set("park", selectedPark);

    fetch(`/api/wait-times?${params}`)
      .then((r) => r.json())
      .then((json) => {
        setWaitTimes(json.data || []);
        setLastFetch(new Date());
      })
      .catch(() => setWaitTimes([]))
      .finally(() => setLoading(false));
  }, [selectedPark]);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const filtered = waitTimes
    .filter((w) => {
      if (!search) return true;
      return (
        w.rideName.toLowerCase().includes(search.toLowerCase()) ||
        w.land.toLowerCase().includes(search.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (sort === "wait-desc") return b.waitMinutes - a.waitMinutes;
      if (sort === "wait-asc") return a.waitMinutes - b.waitMinutes;
      return a.rideName.localeCompare(b.rideName);
    });

  const openRides = filtered.filter((w) => w.isOpen);
  const openCount = openRides.length;
  const avgWait =
    openCount > 0
      ? Math.round(
          openRides.reduce((sum, w) => sum + w.waitMinutes, 0) / openCount
        )
      : 0;

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-foreground">
              Wait Times
            </h1>
            <p className="text-sm text-text-secondary">
              Live ride wait times from Queue-Times.com
              {lastFetch && (
                <span className="ml-1 text-text-secondary">
                  · Updated {lastFetch.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <ParkSelector selected={selectedPark} onChange={setSelectedPark} />
        </div>
      </FadeIn>

      {/* Stats */}
      {!loading && filtered.length > 0 && (
        <FadeIn delay={0.05}>
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="py-3 text-center">
                <p className="font-display text-2xl font-extrabold text-foreground">
                  {filtered.length}
                </p>
                <p className="text-xs text-text-secondary">Total Rides</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-3 text-center">
                <p className="font-display text-2xl font-extrabold text-green-600 dark:text-green-400">
                  {openCount}
                </p>
                <p className="text-xs text-text-secondary">Open Now</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-3 text-center">
                <p className={`font-display text-2xl font-extrabold ${waitColor(avgWait)}`}>
                  {avgWait}m
                </p>
                <p className="text-xs text-text-secondary">Avg Wait</p>
              </CardContent>
            </Card>
          </div>
        </FadeIn>
      )}

      {/* Controls */}
      <FadeIn delay={0.1}>
        <div className="flex flex-col gap-3 sm:flex-row">
          <SearchInput
            placeholder="Search rides..."
            value={search}
            onChange={setSearch}
            className="flex-1"
          />
          <FilterGroup
            options={[
              { value: "wait-desc", label: "Longest" },
              { value: "wait-asc", label: "Shortest" },
              { value: "name", label: "A-Z" },
            ]}
            value={sort}
            onChange={(v) => setSort(v as SortOption)}
            activeColor="bg-rose-500"
            layoutId="wait-sort"
          />
        </div>
      </FadeIn>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : waitTimes.length === 0 ? (
        <EmptyState
          icon={Timer}
          iconColor="text-rose-400"
          title="No wait time data"
          description="Wait time data is unavailable right now. The parks may be closed."
        />
      ) : (
        <StaggerContainer className="space-y-2">
          {filtered.map((wt) => (
            <StaggerItem key={`${wt.parkId}-${wt.rideName}`}>
              <div
                className={`flex items-center justify-between rounded-2xl bg-surface px-4 py-3 shadow-warm-sm ${
                  !wt.isOpen ? "opacity-50" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {wt.rideName}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {PARK_NAMES[wt.parkId] || wt.parkId} · {wt.land}
                  </p>
                </div>
                <div className="ml-4 flex items-center gap-2">
                  {wt.isOpen ? (
                    <div
                      className={`rounded-lg px-3 py-1.5 text-center ${waitBg(wt.waitMinutes)}`}
                    >
                      <span className={`text-lg font-bold ${waitColor(wt.waitMinutes)}`}>
                        {wt.waitMinutes}
                      </span>
                      <span className={`ml-0.5 text-xs ${waitColor(wt.waitMinutes)}`}>
                        min
                      </span>
                    </div>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      Closed
                    </Badge>
                  )}
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </div>
  );
}
