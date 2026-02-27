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
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

interface ParkHourEntry {
  id: number;
  parkId: string;
  date: string;
  openTime: string | null;
  closeTime: string | null;
  earlyEntry: string | null;
  eventName: string | null;
  eventStart: string | null;
  eventEnd: string | null;
}

const PARK_NAMES: Record<string, string> = {
  usf: "Universal Studios",
  ioa: "Islands of Adventure",
  epic: "Epic Universe",
};

const PARK_COLORS: Record<string, string> = {
  usf: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  ioa: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  epic: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
};

function formatTime(time: string | null): string {
  if (!time) return "";
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${m} ${ampm}`;
}

function getMonthDays(year: number, month: number): Date[] {
  const days: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Pad beginning with blanks (handled separately)
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

function dateKey(d: Date): string {
  return d.toISOString().split("T")[0];
}

export default function Client() {
  const [selectedPark, setSelectedPark] = useState<ParkId>("all");
  const [hours, setHours] = useState<ParkHourEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const monthStr = `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, "0")}`;

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedPark !== "all") params.set("park", selectedPark);
    params.set("month", monthStr);

    fetch(`/api/hours?${params}`)
      .then((r) => r.json())
      .then((json) => setHours(json.data || []))
      .catch(() => setHours([]))
      .finally(() => setLoading(false));
  }, [selectedPark, monthStr]);

  const prevMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const nextMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  const days = getMonthDays(currentMonth.year, currentMonth.month);
  const firstDayOfWeek = new Date(currentMonth.year, currentMonth.month, 1).getDay();

  // Group hours by date
  const hoursByDate: Record<string, ParkHourEntry[]> = {};
  for (const h of hours) {
    if (!hoursByDate[h.date]) hoursByDate[h.date] = [];
    hoursByDate[h.date].push(h);
  }

  const monthLabel = new Date(currentMonth.year, currentMonth.month).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Park Hours
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Operating hours, early entry, and special events
          </p>
        </div>
        <ParkSelector selected={selectedPark} onChange={setSelectedPark} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-violet-600" />
              {monthLabel}
            </CardTitle>
            <div className="flex gap-1">
              <button
                onClick={prevMonth}
                className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextMonth}
                className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <CardDescription>
            {selectedPark === "all"
              ? "Showing hours for all parks"
              : `Showing hours for ${PARK_NAMES[selectedPark]}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <p className="text-sm text-zinc-500">Loading hours...</p>
            </div>
          ) : hours.length === 0 ? (
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700">
              <div className="text-center">
                <p className="text-sm text-zinc-500">
                  No hours data for this month. Run the scraper to populate data.
                </p>
                <code className="mt-2 block text-xs text-zinc-400">pnpm scrape</code>
              </div>
            </div>
          ) : (
            <>
              {/* Day headers */}
              <div className="mb-2 grid grid-cols-7 gap-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="py-1 text-center text-xs font-medium text-zinc-500">
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for padding */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {days.map((day) => {
                  const key = dateKey(day);
                  const dayHours = hoursByDate[key] || [];
                  const isToday = key === new Date().toISOString().split("T")[0];

                  return (
                    <div
                      key={key}
                      className={`min-h-[80px] rounded-lg border p-1.5 ${
                        isToday
                          ? "border-violet-300 bg-violet-50/50 dark:border-violet-700 dark:bg-violet-950/20"
                          : "border-zinc-200 dark:border-zinc-800"
                      }`}
                    >
                      <p
                        className={`text-xs font-medium ${
                          isToday
                            ? "text-violet-700 dark:text-violet-400"
                            : "text-zinc-500"
                        }`}
                      >
                        {day.getDate()}
                      </p>
                      <div className="mt-0.5 space-y-0.5">
                        {dayHours.map((h) => (
                          <div
                            key={h.id}
                            className={`rounded px-1 py-0.5 text-[10px] leading-tight ${
                              PARK_COLORS[h.parkId] || "bg-zinc-100 text-zinc-700"
                            }`}
                          >
                            <span className="font-medium">
                              {PARK_NAMES[h.parkId]?.slice(0, 3) || h.parkId}
                            </span>
                            {h.openTime && h.closeTime && (
                              <span className="block">
                                {formatTime(h.openTime)}-{formatTime(h.closeTime)}
                              </span>
                            )}
                            {h.earlyEntry && (
                              <span className="block opacity-75">
                                Early: {formatTime(h.earlyEntry)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
