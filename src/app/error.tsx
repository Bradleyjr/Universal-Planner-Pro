"use client";

import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 inline-flex rounded-2xl bg-rose-50 p-4 text-rose-400 dark:bg-rose-900/20">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="font-display text-xl font-bold text-foreground">
          Something went wrong
        </h2>
        <p className="mt-2 max-w-sm text-sm text-text-secondary">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <button
          onClick={reset}
          className="mt-4 rounded-full bg-stone-900 px-5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-stone-800 active:scale-[0.98] dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
