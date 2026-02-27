import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Ticket,
  FerrisWheel,
  Utensils,
  Clock,
  Hotel,
  Calendar,
} from "lucide-react";
import Link from "next/link";

const sections = [
  {
    title: "Ticket Prices",
    description: "Daily pricing for 1, 2, and 3-park tickets plus Express passes",
    href: "/tickets",
    icon: Ticket,
  },
  {
    title: "Attractions",
    description: "Rides, shows, and experiences across all three parks",
    href: "/attractions",
    icon: FerrisWheel,
  },
  {
    title: "Dining",
    description: "Restaurants, quick service, and food carts with menu links",
    href: "/dining",
    icon: Utensils,
  },
  {
    title: "Park Hours",
    description: "Operating hours, early entry, and event schedules",
    href: "/hours",
    icon: Clock,
  },
  {
    title: "Hotels",
    description: "On-site hotel pricing, tiers, and included perks",
    href: "/hotels",
    icon: Hotel,
  },
  {
    title: "Events",
    description: "HHN, Mardi Gras, Holidays, and special event pricing",
    href: "/events",
    icon: Calendar,
  },
];

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Universal Planner Pro
        </h1>
        <p className="max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          Track ticket prices, plan your park days, and find the best deals for
          Universal Orlando — Islands of Adventure, Universal Studios Florida,
          and Epic Universe.
        </p>
      </div>

      {/* Park Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {["Islands of Adventure", "Universal Studios Florida", "Epic Universe"].map(
          (park) => (
            <Card key={park}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{park}</CardTitle>
                <CardDescription>No hours data yet</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-zinc-400 dark:text-zinc-600">
                  --
                </p>
                <p className="text-xs text-zinc-500">
                  Data available after first scrape
                </p>
              </CardContent>
            </Card>
          )
        )}
      </div>

      {/* Section Grid */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Explore
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <Link key={section.href} href={section.href}>
              <Card className="h-full transition-colors hover:border-violet-300 hover:shadow-md dark:hover:border-violet-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <section.icon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    <Badge variant="secondary">Coming Soon</Badge>
                  </div>
                  <CardTitle className="text-base">{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
