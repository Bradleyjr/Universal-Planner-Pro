"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
    <div className="flex gap-1 rounded-full bg-stone-100 p-1 dark:bg-stone-800/50">
      {parks.map((park) => {
        const isActive = selected === park.id;
        return (
          <button
            key={park.id}
            onClick={() => onChange(park.id)}
            className={cn(
              "relative rounded-full px-4 py-1.5 text-sm font-semibold transition-colors duration-200",
              isActive
                ? "text-white dark:text-stone-900"
                : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="park-selector-active"
                className="absolute inset-0 rounded-full bg-stone-900 dark:bg-stone-100"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative z-10">{park.label}</span>
          </button>
        );
      })}
    </div>
  );
}
