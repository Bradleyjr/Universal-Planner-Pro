import Link from "next/link";
import { MapPin } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 inline-flex rounded-2xl bg-violet-50 p-4 text-violet-400 dark:bg-violet-900/20">
          <MapPin className="h-8 w-8" />
        </div>
        <h2 className="font-display text-xl font-bold text-foreground">
          Page Not Found
        </h2>
        <p className="mt-2 max-w-sm text-sm text-text-secondary">
          Looks like you took a wrong turn! This page doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-full bg-stone-900 px-5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-stone-800 active:scale-[0.98] dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
