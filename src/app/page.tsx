import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Ticket,
  FerrisWheel,
  Utensils,
  Clock,
  Hotel,
  Calendar,
  Timer,
} from "lucide-react";
import Link from "next/link";

const sections = [
  {
    title: "Ticket Prices",
    description: "Daily pricing for 1, 2, and 3-park tickets plus Express passes",
    href: "/tickets",
    icon: Ticket,
    color: "text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "Attractions",
    description: "Rides, shows, and experiences across all three parks",
    href: "/attractions",
    icon: FerrisWheel,
    color: "text-blue-600 dark:text-blue-400",
  },
  {
    title: "Dining",
    description: "Restaurants, quick service, and food carts with menu links",
    href: "/dining",
    icon: Utensils,
    color: "text-orange-600 dark:text-orange-400",
  },
  {
    title: "Park Hours",
    description: "Operating hours, early entry, and event schedules",
    href: "/hours",
    icon: Clock,
    color: "text-violet-600 dark:text-violet-400",
  },
  {
    title: "Wait Times",
    description: "Live ride wait times from Queue-Times.com",
    href: "/wait-times",
    icon: Timer,
    color: "text-red-600 dark:text-red-400",
  },
  {
    title: "Hotels",
    description: "On-site hotel pricing, tiers, and included perks",
    href: "/hotels",
    icon: Hotel,
    color: "text-amber-600 dark:text-amber-400",
  },
  {
    title: "Events",
    description: "HHN, Mardi Gras, Holidays, and special event pricing",
    href: "/events",
    icon: Calendar,
    color: "text-pink-600 dark:text-pink-400",
  },
];

const parks = [
  { id: "ioa", name: "Islands of Adventure", color: "border-green-500" },
  { id: "usf", name: "Universal Studios Florida", color: "border-blue-500" },
  { id: "epic", name: "Epic Universe", color: "border-purple-500" },
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
      <div className="grid gap-4 sm:grid-cols-3">
        {parks.map((park) => (
          <Card key={park.name} className={`border-t-2 ${park.color}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{park.name}</CardTitle>
              <CardDescription>
                View hours, attractions, and dining
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Link
                  href={`/hours?park=${park.id}`}
                  className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  Hours
                </Link>
                <Link
                  href={`/wait-times?park=${park.id}`}
                  className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  Wait Times
                </Link>
                <Link
                  href={`/attractions?park=${park.id}`}
                  className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  Attractions
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
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
                  <section.icon className={`h-5 w-5 ${section.color}`} />
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
