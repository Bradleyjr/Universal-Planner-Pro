"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ParkSelector, type ParkId } from "@/components/park-selector";
import { Utensils } from "lucide-react";
import { useState } from "react";

export default function DiningPage() {
  const [selectedPark, setSelectedPark] = useState<ParkId>("all");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Dining
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Restaurants, quick service, and food carts
          </p>
        </div>
        <ParkSelector selected={selectedPark} onChange={setSelectedPark} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Utensils className="h-4 w-4 text-violet-600" />
            All Dining
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700">
            <p className="text-sm text-zinc-500">
              Dining listings will appear here after the first scrape runs.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
