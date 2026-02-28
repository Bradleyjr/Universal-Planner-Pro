"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Ticket,
  FerrisWheel,
  Utensils,
  Clock,
  Hotel,
  Calendar,
  LayoutDashboard,
  Timer,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, color: "text-stone-600" },
  { href: "/tickets", label: "Tickets", icon: Ticket, color: "text-emerald-500" },
  { href: "/attractions", label: "Attractions", icon: FerrisWheel, color: "text-sky-500" },
  { href: "/dining", label: "Dining", icon: Utensils, color: "text-orange-500" },
  { href: "/hours", label: "Park Hours", icon: Clock, color: "text-violet-500" },
  { href: "/wait-times", label: "Wait Times", icon: Timer, color: "text-rose-500" },
  { href: "/hotels", label: "Hotels", icon: Hotel, color: "text-amber-500" },
  { href: "/events", label: "Events", icon: Calendar, color: "text-fuchsia-500" },
];

export function Nav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display text-xl font-extrabold tracking-tight text-foreground">
              Universal Planner
            </span>
            <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-bold text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
              Pro
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex md:items-center md:gap-0.5">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors duration-200",
                    isActive
                      ? "text-foreground"
                      : "text-text-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("h-4 w-4", isActive ? item.color : "")} />
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-current"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-xl p-2 text-text-secondary hover:bg-stone-100 md:hidden dark:hover:bg-stone-800"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden border-t border-border md:hidden"
          >
            <div className="space-y-1 px-4 py-3">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors duration-200",
                      isActive
                        ? "bg-stone-100 text-foreground dark:bg-stone-800"
                        : "text-text-secondary hover:bg-stone-50 hover:text-foreground dark:hover:bg-stone-800/50"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", isActive ? item.color : "")} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
