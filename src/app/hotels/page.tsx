"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Hotel } from "lucide-react";

export default function HotelsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Hotels
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          On-site hotel pricing, tiers, and included perks
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Hotel className="h-4 w-4 text-violet-600" />
            Hotel Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700">
            <p className="text-sm text-zinc-500">
              Hotel pricing comparison will appear here after the first scrape runs.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
