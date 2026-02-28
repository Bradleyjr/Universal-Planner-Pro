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
import { EmptyState } from "@/components/empty-state";
import { FadeIn, Skeleton } from "@/components/motion";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

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

const PARK_ABBREVS: Record<string, string> = {
  usf: "USF",
  ioa: "IOA",
  epic: "EU",
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
  const searchParams = useSearchParams();
  const [selectedPark, setSelectedPark] = useState<ParkId>(
    () => (searchParams.get("park") as ParkId) || "all"
  );
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
    <div className="space-y-8">
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-foreground">
              Park Hours
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Operating hours, early entry, and special events
            </p>
          </div>
          <ParkSelector selected={selectedPark} onChange={setSelectedPark} />
        </div>
      </FadeIn>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-violet-500" />
              {monthLabel}
            </CardTitle>
            <div className="flex gap-1">
              <button
                onClick={prevMonth}
                className="rounded-xl p-1.5 text-text-secondary hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextMonth}
                className="rounded-xl p-1.5 text-text-secondary hover:bg-stone-100 dark:hover:bg-stone-800"
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
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : hours.length === 0 ? (
            <EmptyState
              icon={Clock}
              iconColor="text-violet-400"
              title="No hours data"
              description="No hours data for this month. Run the scraper to populate data."
            />
          ) : (
            <div className="-mx-2 overflow-x-auto px-2 sm:mx-0 sm:px-0">
              <div className="min-w-[600px]">
              {/* Day headers */}
              <div className="mb-2 grid grid-cols-7 gap-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="py-1 text-center text-xs font-medium text-text-secondary">
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
                          : "border-stone-200 dark:border-stone-800"
                      }`}
                    >
                      <p
                        className={`text-xs font-medium ${
                          isToday
                            ? "text-violet-700 dark:text-violet-400"
                            : "text-text-secondary"
                        }`}
                      >
                        {day.getDate()}
                      </p>
                      <div className="mt-0.5 space-y-0.5">
                        {dayHours.map((h) => (
                          <div
                            key={h.id}
                            className={`rounded px-1 py-0.5 text-[10px] leading-tight ${
                              PARK_COLORS[h.parkId] || "bg-stone-100 text-stone-700"
                            }`}
                          >
                            <span className="font-medium">
                              {PARK_ABBREVS[h.parkId] || h.parkId}
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
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
