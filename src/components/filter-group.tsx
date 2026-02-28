"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterGroupProps {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  /** Tailwind color class for active state, e.g. "bg-emerald-500" */
  activeColor?: string;
  /** Unique layout ID for Framer Motion animation (needed if multiple FilterGroups on one page) */
  layoutId?: string;
}

export function FilterGroup({
  options,
  value,
  onChange,
  activeColor = "bg-stone-900 dark:bg-stone-100",
  layoutId = "filter-active",
}: FilterGroupProps) {
  return (
    <div className="flex gap-1 rounded-full bg-stone-100 p-1 dark:bg-stone-800/50">
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative rounded-full px-4 py-1.5 text-sm font-semibold transition-colors duration-200",
              isActive
                ? "text-white dark:text-stone-900"
                : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
            )}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className={cn("absolute inset-0 rounded-full", activeColor)}
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
