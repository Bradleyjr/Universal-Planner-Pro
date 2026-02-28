"use client";

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
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";
import { motion } from "framer-motion";

const sections = [
  {
    title: "Ticket Prices",
    description: "Daily pricing for 1, 2, and 3-park tickets plus Express passes",
    href: "/tickets",
    icon: Ticket,
    color: "text-emerald-500",
    bgGradient: "from-emerald-50 to-transparent dark:from-emerald-950/20",
    borderColor: "group-hover:border-emerald-200 dark:group-hover:border-emerald-800",
  },
  {
    title: "Attractions",
    description: "Rides, shows, and experiences across all three parks",
    href: "/attractions",
    icon: FerrisWheel,
    color: "text-sky-500",
    bgGradient: "from-sky-50 to-transparent dark:from-sky-950/20",
    borderColor: "group-hover:border-sky-200 dark:group-hover:border-sky-800",
  },
  {
    title: "Dining",
    description: "Restaurants, quick service, and food carts with menu links",
    href: "/dining",
    icon: Utensils,
    color: "text-orange-500",
    bgGradient: "from-orange-50 to-transparent dark:from-orange-950/20",
    borderColor: "group-hover:border-orange-200 dark:group-hover:border-orange-800",
  },
  {
    title: "Park Hours",
    description: "Operating hours, early entry, and event schedules",
    href: "/hours",
    icon: Clock,
    color: "text-violet-500",
    bgGradient: "from-violet-50 to-transparent dark:from-violet-950/20",
    borderColor: "group-hover:border-violet-200 dark:group-hover:border-violet-800",
  },
  {
    title: "Wait Times",
    description: "Live ride wait times from Queue-Times.com",
    href: "/wait-times",
    icon: Timer,
    color: "text-rose-500",
    bgGradient: "from-rose-50 to-transparent dark:from-rose-950/20",
    borderColor: "group-hover:border-rose-200 dark:group-hover:border-rose-800",
  },
  {
    title: "Hotels",
    description: "On-site hotel pricing, tiers, and included perks",
    href: "/hotels",
    icon: Hotel,
    color: "text-amber-500",
    bgGradient: "from-amber-50 to-transparent dark:from-amber-950/20",
    borderColor: "group-hover:border-amber-200 dark:group-hover:border-amber-800",
  },
  {
    title: "Events",
    description: "HHN, Mardi Gras, Holidays, and special event pricing",
    href: "/events",
    icon: Calendar,
    color: "text-fuchsia-500",
    bgGradient: "from-fuchsia-50 to-transparent dark:from-fuchsia-950/20",
    borderColor: "group-hover:border-fuchsia-200 dark:group-hover:border-fuchsia-800",
  },
];

const parks = [
  { id: "ioa", name: "Islands of Adventure", color: "border-emerald-400" },
  { id: "usf", name: "Universal Studios Florida", color: "border-sky-400" },
  { id: "epic", name: "Epic Universe", color: "border-violet-400" },
];

export function HomeClient() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <FadeIn>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-50 via-sky-50 to-orange-50 px-8 py-12 dark:from-violet-950/20 dark:via-sky-950/20 dark:to-orange-950/20">
          {/* Decorative floating shapes */}
          <motion.div
            className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-violet-200/30 dark:bg-violet-800/20"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-4 left-1/3 h-20 w-20 rounded-full bg-sky-200/30 dark:bg-sky-800/20"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute right-1/4 top-1/2 h-12 w-12 rounded-full bg-orange-200/30 dark:bg-orange-800/20"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative z-10">
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Plan Your Perfect{" "}
              <span className="bg-gradient-to-r from-violet-600 via-sky-500 to-orange-500 bg-clip-text text-transparent">
                Universal Day
              </span>
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-text-secondary">
              Track ticket prices, plan your park days, and find the best deals
              for Universal Orlando — Islands of Adventure, Universal Studios
              Florida, and Epic Universe.
            </p>
          </div>
        </div>
      </FadeIn>

      {/* Park Overview Cards */}
      <StaggerContainer className="grid gap-4 sm:grid-cols-3">
        {parks.map((park) => (
          <StaggerItem key={park.name}>
            <Card className={`border-t-3 ${park.color}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{park.name}</CardTitle>
                <CardDescription>
                  View hours, attractions, and dining
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {[
                    { href: `/hours?park=${park.id}`, label: "Hours" },
                    { href: `/wait-times?park=${park.id}`, label: "Wait Times" },
                    { href: `/attractions?park=${park.id}`, label: "Attractions" },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700 transition-all duration-200 hover:bg-stone-200 active:scale-[0.97] dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Section Grid */}
      <div>
        <h2 className="font-display mb-5 text-xl font-bold tracking-tight text-foreground">
          Explore
        </h2>
        <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sections.map((section) => (
            <StaggerItem key={section.href}>
              <Link href={section.href} className="group block">
                <Card className={`h-full overflow-hidden border border-transparent bg-gradient-to-br ${section.bgGradient} ${section.borderColor} transition-all duration-200`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <motion.div whileHover={{ rotate: [0, -8, 8, -4, 4, 0] }} transition={{ duration: 0.4 }}>
                        <section.icon className={`h-6 w-6 ${section.color}`} />
                      </motion.div>
                      <ArrowRight className="h-4 w-4 text-text-secondary transition-transform duration-200 group-hover:translate-x-1" />
                    </div>
                    <CardTitle className="text-base">{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </div>
  );
}
