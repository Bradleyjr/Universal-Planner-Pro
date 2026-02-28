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
import { Timer, Search, CircleDot } from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Wait Times
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Live ride wait times from Queue-Times.com
            {lastFetch && (
              <span className="ml-1 text-zinc-400">
                · Updated {lastFetch.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <ParkSelector selected={selectedPark} onChange={setSelectedPark} />
      </div>

      {/* Stats */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="py-3 text-center">
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {filtered.length}
              </p>
              <p className="text-xs text-zinc-500">Total Rides</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {openCount}
              </p>
              <p className="text-xs text-zinc-500">Open Now</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 text-center">
              <p className={`text-2xl font-bold ${waitColor(avgWait)}`}>
                {avgWait}m
              </p>
              <p className="text-xs text-zinc-500">Avg Wait</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search rides..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </div>
        <div className="flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800/50">
          {[
            { id: "wait-desc" as const, label: "Longest" },
            { id: "wait-asc" as const, label: "Shortest" },
            { id: "name" as const, label: "A-Z" },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSort(opt.id)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                sort === opt.id
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-zinc-500">Loading wait times...</p>
        </div>
      ) : waitTimes.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Timer className="mb-4 h-8 w-8 text-zinc-300" />
              <p className="text-sm text-zinc-500">
                Wait time data is unavailable right now. The parks may be closed.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((wt) => (
            <div
              key={`${wt.parkId}-${wt.rideName}`}
              className={`flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800 ${
                !wt.isOpen ? "opacity-50" : ""
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {wt.rideName}
                </p>
                <p className="text-xs text-zinc-500">
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
          ))}
        </div>
      )}
    </div>
  );
}
