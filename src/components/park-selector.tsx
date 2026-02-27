"use client";

import { cn } from "@/lib/utils";

const parks = [
  { id: "all", label: "All Parks" },
  { id: "usf", label: "Universal Studios" },
  { id: "ioa", label: "Islands of Adventure" },
  { id: "epic", label: "Epic Universe" },
] as const;

export type ParkId = (typeof parks)[number]["id"];

interface ParkSelectorProps {
  selected: ParkId;
  onChange: (park: ParkId) => void;
}

export function ParkSelector({ selected, onChange }: ParkSelectorProps) {
  return (
    <div className="flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800/50">
      {parks.map((park) => (
        <button
          key={park.id}
          onClick={() => onChange(park.id)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            selected === park.id
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          )}
        >
          {park.label}
        </button>
      ))}
    </div>
  );
}
