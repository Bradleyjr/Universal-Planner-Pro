# "Sunny Day Out" Design System — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a vibrant, playful design system foundation (colors, typography, components, animations) for Universal Planner Pro, then apply it to the homepage and all pages.

**Architecture:** Design system first approach — build tokens/primitives in `globals.css` and shared components, then apply incrementally. All source code lives on the `claude/add-codebase-docs-FLhKv` branch and must be merged into `update-ui` first. Framer Motion handles all animations. Nunito font for display headings, Geist Sans for body.

**Tech Stack:** Next.js 16, Tailwind CSS v4, Framer Motion, Nunito (Google Fonts via `next/font/google`), shadcn/ui (new-york style), Lucide React icons, CVA for component variants.

---

## Prerequisites

### Task 0: Merge source code into update-ui branch

The `update-ui` branch currently only has README.md and docs/. All source code is on `claude/add-codebase-docs-FLhKv`. We need to merge it first.

**Files:** All files from `claude/add-codebase-docs-FLhKv`

**Step 1: Merge the source branch**

```bash
git merge claude/add-codebase-docs-FLhKv --no-edit
```

**Step 2: Verify the merge**

```bash
ls src/app/layout.tsx src/components/nav.tsx package.json
```

Expected: All three files exist.

**Step 3: Install dependencies**

```bash
pnpm install
```

**Step 4: Verify the app builds**

```bash
pnpm build
```

Expected: Build succeeds with no errors.

**Step 5: Commit if needed**

If the merge created a commit automatically, skip. Otherwise:

```bash
git add -A && git commit -m "merge: bring source code into update-ui branch"
```

---

## Phase 1: Design System Foundation

### Task 1: Install framer-motion and Nunito font

**Files:**
- Modify: `package.json`
- Modify: `src/app/layout.tsx`

**Step 1: Install framer-motion**

```bash
pnpm add framer-motion
```

**Step 2: Verify framer-motion installed**

```bash
grep framer-motion package.json
```

Expected: `"framer-motion": "^..."` in dependencies.

**Step 3: Add Nunito font to layout.tsx**

Replace the font imports and body setup in `src/app/layout.tsx`. Change:

```tsx
import localFont from "next/font/local";
```

To:

```tsx
import localFont from "next/font/local";
import { Nunito } from "next/font/google";
```

Add after the geistMono declaration:

```tsx
const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["400", "600", "700", "800"],
});
```

Update the body className to include the Nunito variable:

```tsx
className={`${geistSans.variable} ${geistMono.variable} ${nunito.variable} antialiased`}
```

**Step 4: Verify the app still builds**

```bash
pnpm build
```

Expected: Build succeeds.

**Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml src/app/layout.tsx
git commit -m "feat: add framer-motion and Nunito font"
```

---

### Task 2: Update color tokens and base theme in globals.css

**Files:**
- Modify: `src/app/globals.css`

**Step 1: Replace globals.css with the new design system tokens**

Replace the entire contents of `src/app/globals.css` with:

```css
@import "tailwindcss";

@theme inline {
  /* Fonts */
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --font-display: var(--font-nunito);

  /* Base colors */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-surface: var(--surface);
  --color-border: var(--border-color);
  --color-text-secondary: var(--text-secondary);

  /* Section accent colors */
  --color-accent-tickets: #10B981;
  --color-accent-attractions: #0EA5E9;
  --color-accent-dining: #F97316;
  --color-accent-hours: #8B5CF6;
  --color-accent-wait-times: #F43F5E;
  --color-accent-hotels: #F59E0B;
  --color-accent-events: #D946EF;

  /* Warm shadow color */
  --shadow-color: 28 25 23;
}

:root {
  --background: #FDFBF7;
  --foreground: #1C1917;
  --surface: #FFFFFF;
  --border-color: #E7E5E4;
  --text-secondary: #78716C;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0C0A09;
    --foreground: #F5F5F4;
    --surface: #1C1917;
    --border-color: #292524;
    --text-secondary: #A8A29E;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans), Arial, Helvetica, sans-serif;
}

/* Warm shadows utility */
.shadow-warm-sm {
  box-shadow: 0 1px 2px 0 rgb(var(--shadow-color) / 0.04);
}
.shadow-warm {
  box-shadow: 0 1px 3px 0 rgb(var(--shadow-color) / 0.06), 0 1px 2px -1px rgb(var(--shadow-color) / 0.06);
}
.shadow-warm-md {
  box-shadow: 0 4px 6px -1px rgb(var(--shadow-color) / 0.06), 0 2px 4px -2px rgb(var(--shadow-color) / 0.06);
}
.shadow-warm-lg {
  box-shadow: 0 10px 15px -3px rgb(var(--shadow-color) / 0.06), 0 4px 6px -4px rgb(var(--shadow-color) / 0.06);
}

/* Skeleton shimmer animation */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(90deg, var(--border-color) 25%, var(--surface) 50%, var(--border-color) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite ease-in-out;
  border-radius: 0.5rem;
}
```

**Step 2: Verify the app builds**

```bash
pnpm build
```

Expected: Build succeeds. Some pages may look different now (warm background instead of white).

**Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add warm color tokens and design system theme"
```

---

### Task 3: Update Card component with new design system

**Files:**
- Modify: `src/components/ui/card.tsx`

**Step 1: Update Card component**

Replace the entire contents of `src/components/ui/card.tsx` with:

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl bg-surface shadow-warm-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-warm-lg",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 p-7", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-display font-bold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-text-secondary", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-7 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-7 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
```

Key changes:
- `rounded-xl` → `rounded-2xl`
- Border removed, warm shadows instead (`shadow-warm-md`)
- Hover: lift (`-translate-y-0.5`) + stronger shadow (`shadow-warm-lg`)
- Padding: `p-6` → `p-7` (28px)
- Uses `bg-surface`, `text-text-secondary` design tokens
- `font-display` on CardTitle for Nunito headings
- Added `transition-all duration-200` for smooth hover

**Step 2: Verify the app builds**

```bash
pnpm build
```

Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/components/ui/card.tsx
git commit -m "feat: update Card with warm shadows, rounded-2xl, hover lift"
```

---

### Task 4: Update Badge component with pill shape and section colors

**Files:**
- Modify: `src/components/ui/badge.tsx`

**Step 1: Replace badge.tsx with new design**

Replace the entire contents of `src/components/ui/badge.tsx` with:

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900",
        secondary:
          "border-transparent bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
        destructive:
          "border-transparent bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
        outline: "text-foreground",
        tickets:
          "border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
        attractions:
          "border-transparent bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
        dining:
          "border-transparent bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
        hours:
          "border-transparent bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
        waitTimes:
          "border-transparent bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
        hotels:
          "border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        events:
          "border-transparent bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
```

Key changes:
- `rounded-md` → `rounded-full` (pill shape)
- `px-2.5` → `px-3` (slightly more horizontal padding)
- Added section-specific color variants (tickets, attractions, dining, etc.)
- Uses tinted background + darker text pattern per design doc
- Warm stone colors instead of zinc

**Step 2: Verify the app builds**

```bash
pnpm build
```

Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/components/ui/badge.tsx
git commit -m "feat: update Badge with pill shape and section color variants"
```

---

### Task 5: Update Button component with pill shape

**Files:**
- Modify: `src/components/ui/button.tsx`

**Step 1: Replace button.tsx with new design**

Replace the entire contents of `src/components/ui/button.tsx` with:

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-stone-900 text-white shadow-warm-sm hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200",
        destructive:
          "bg-rose-500 text-white shadow-warm-sm hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700",
        outline:
          "border border-border bg-surface shadow-warm-sm hover:bg-stone-50 dark:hover:bg-stone-800",
        secondary:
          "bg-stone-100 text-stone-700 shadow-warm-sm hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700",
        ghost:
          "hover:bg-stone-100 dark:hover:bg-stone-800",
        link: "text-stone-900 underline-offset-4 hover:underline dark:text-stone-100",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-4 text-xs",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

Key changes:
- `rounded-md` → `rounded-full` (pill shape)
- Added `active:scale-[0.98]` for tactile press feel
- `transition-colors` → `transition-all duration-200`
- Warm stone colors instead of zinc
- Slightly larger default: `h-9 px-4` → `h-10 px-5`
- Uses `shadow-warm-sm` for subtle depth
- `font-medium` → `font-semibold`

**Step 2: Verify the app builds**

```bash
pnpm build
```

Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/components/ui/button.tsx
git commit -m "feat: update Button with pill shape, warm colors, press feedback"
```

---

### Task 6: Create FilterGroup reusable component

**Files:**
- Create: `src/components/filter-group.tsx`

**Step 1: Create the FilterGroup component**

Create `src/components/filter-group.tsx`:

```tsx
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
}

export function FilterGroup({
  options,
  value,
  onChange,
  activeColor = "bg-stone-900 dark:bg-stone-100",
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
                layoutId="filter-active"
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
```

Key features:
- Reusable across all pages (replaces 8+ copy-pasted filter groups)
- Framer Motion `layoutId` for smooth sliding active indicator
- `rounded-full` pill shape
- Configurable active color per section
- Spring animation with bounce for playful feel

**Step 2: Verify the app builds**

```bash
pnpm build
```

Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/components/filter-group.tsx
git commit -m "feat: create FilterGroup component with animated selection"
```

---

### Task 7: Create animation primitives

**Files:**
- Create: `src/components/motion.tsx`

**Step 1: Create shared animation components**

Create `src/components/motion.tsx`:

```tsx
"use client";

import { motion, type Variants } from "framer-motion";
import React from "react";

/* Fade-in with upward slide — use for page content */
export function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* Staggered children container — wraps a list of items */
const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export function StaggerContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  );
}

/* Scroll reveal — animates when entering viewport */
export function ScrollReveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-64px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* Wiggle animation for icons on hover */
export function WiggleOnHover({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{
        rotate: [0, -8, 8, -4, 4, 0],
        transition: { duration: 0.4 },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* Pop effect — scale up then settle */
export function Pop({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", bounce: 0.4, duration: 0.5 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* Skeleton loader component */
export function Skeleton({ className }: { className?: string }) {
  return <div className={`skeleton ${className ?? ""}`} />;
}
```

**Step 2: Verify the app builds**

```bash
pnpm build
```

Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/components/motion.tsx
git commit -m "feat: create animation primitives (FadeIn, Stagger, ScrollReveal, Wiggle)"
```

---

### Task 8: Create SearchInput reusable component

**Files:**
- Create: `src/components/search-input.tsx`

**Step 1: Create SearchInput component**

Create `src/components/search-input.tsx`:

```tsx
"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className,
}: SearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-surface py-2.5 pl-11 pr-4 text-sm text-foreground placeholder:text-text-secondary transition-all duration-200 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200 dark:focus:ring-stone-700"
      />
    </div>
  );
}
```

Key features:
- `rounded-xl` per design doc
- Uses design tokens (`bg-surface`, `border-border`, `text-foreground`, `text-text-secondary`)
- Warm focus ring (stone instead of violet)
- Reusable across Attractions, Dining, Wait Times pages

**Step 2: Verify the app builds**

```bash
pnpm build
```

Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/components/search-input.tsx
git commit -m "feat: create SearchInput component with warm design tokens"
```

---

### Task 9: Create EmptyState reusable component

**Files:**
- Create: `src/components/empty-state.tsx`

**Step 1: Create EmptyState component**

Create `src/components/empty-state.tsx`:

```tsx
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Tailwind text color class for the icon, e.g. "text-emerald-400" */
  iconColor?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  iconColor = "text-stone-300",
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className={cn("mb-4 rounded-2xl bg-stone-50 p-4 dark:bg-stone-800/50", iconColor)}>
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="font-display text-lg font-bold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-text-secondary">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 rounded-full bg-stone-900 px-5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-stone-800 active:scale-[0.98] dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
```

**Step 2: Verify the app builds**

```bash
pnpm build
```

Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/components/empty-state.tsx
git commit -m "feat: create EmptyState component with icon, friendly copy, action"
```

---

### Task 10: Update ParkSelector with new design

**Files:**
- Modify: `src/components/park-selector.tsx`

**Step 1: Replace park-selector.tsx with new design**

Replace the entire contents of `src/components/park-selector.tsx` with:

```tsx
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
```

Key changes:
- `rounded-lg` → `rounded-full` (pill container and items)
- Framer Motion `layoutId` for animated sliding indicator
- Stone colors instead of zinc
- `font-medium` → `font-semibold`
- Spring animation for playful selection feel

**Step 2: Verify the app builds**

```bash
pnpm build
```

Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/components/park-selector.tsx
git commit -m "feat: update ParkSelector with pill shape and animated selection"
```

---

## Phase 2: Apply Design System to Layout & Navigation

### Task 11: Redesign the Nav component

**Files:**
- Modify: `src/components/nav.tsx`

**Step 1: Replace nav.tsx with the new design**

Replace the entire contents of `src/components/nav.tsx` with:

```tsx
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
```

Key changes:
- Sticky with warm backdrop blur (`bg-background/80 backdrop-blur-lg`)
- `max-w-7xl` → `max-w-6xl` (narrower for readability)
- Section-colored icons when active
- Framer Motion sliding underline for active nav item
- Mobile: animated slide-out drawer replaces horizontal scroll
- `font-display` for logo (Nunito)
- Uses design tokens: `bg-background`, `border-border`, `text-foreground`, `text-text-secondary`

**Step 2: Verify the app builds**

```bash
pnpm build
```

Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/components/nav.tsx
git commit -m "feat: redesign Nav with backdrop blur, animated active indicator, mobile drawer"
```

---

### Task 12: Update root layout with new design

**Files:**
- Modify: `src/app/layout.tsx`

**Step 1: Update layout.tsx**

Update the `<main>` tag in `src/app/layout.tsx` to use the new max-width and spacing:

Change:
```tsx
<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
```

To:
```tsx
<main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
```

Key changes:
- `max-w-7xl` → `max-w-6xl` (matches nav, narrower for readability)
- `py-8` → `py-10` (more breathing room)

**Step 2: Verify the app builds**

```bash
pnpm build
```

Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: update root layout to max-w-6xl with more vertical spacing"
```

---

## Phase 3: Redesign Homepage

### Task 13: Redesign the homepage with hero, stats bar, and section grid

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Replace page.tsx with the new homepage design**

Replace the entire contents of `src/app/page.tsx` with:

```tsx
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
import { HomeClient } from "./home-client";

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

export default function Home() {
  return <HomeClient sections={sections} parks={parks} />;
}
```

**Step 2: Create the client component for animations**

Create `src/app/home-client.tsx`:

```tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";
import { motion } from "framer-motion";

interface Section {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  color: string;
  bgGradient: string;
  borderColor: string;
}

interface Park {
  id: string;
  name: string;
  color: string;
}

export function HomeClient({
  sections,
  parks,
}: {
  sections: Section[];
  parks: Park[];
}) {
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
```

Key features:
- Hero with gradient background and floating parallax shapes
- Gradient text on "Universal Day"
- Staggered card animations on load
- Section cards with gradient backgrounds per section color
- Arrow slides right on hover
- Icon wiggle on hover
- `font-display` (Nunito) for all headings
- Park quick-link pills are `rounded-full`
- 4-column grid on xl screens for section cards

**Step 3: Verify the app builds**

```bash
pnpm build
```

Expected: Build succeeds.

**Step 4: Commit**

```bash
git add src/app/page.tsx src/app/home-client.tsx
git commit -m "feat: redesign homepage with hero, gradient sections, staggered animations"
```

---

## Phase 4: Apply Design System to Content Pages

### Task 14: Update Tickets page with design system

**Files:**
- Modify: `src/app/tickets/client.tsx`

**Step 1: Update the Tickets client component**

Replace the entire contents of `src/app/tickets/client.tsx` with:

```tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FilterGroup } from "@/components/filter-group";
import { EmptyState } from "@/components/empty-state";
import { FadeIn, StaggerContainer, StaggerItem, Skeleton } from "@/components/motion";
import { Ticket } from "lucide-react";
import { useEffect, useState } from "react";

interface TicketPrice {
  id: number;
  date: string;
  parkCombo: string;
  tier: string | null;
  adultPrice: string;
  childPrice: string;
  scrapedAt: string;
}

const COMBO_OPTIONS = [
  { value: "1-park", label: "1-Park" },
  { value: "2-park", label: "2-Park" },
  { value: "3-park", label: "3-Park" },
];

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function priceColor(price: number): string {
  if (price < 120) return "text-emerald-600 dark:text-emerald-400";
  if (price < 160) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

export default function Client() {
  const [prices, setPrices] = useState<TicketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [combo, setCombo] = useState("1-park");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/tickets?combo=${combo}&range=30`)
      .then((r) => r.json())
      .then((json) => setPrices(json.data || []))
      .catch(() => setPrices([]))
      .finally(() => setLoading(false));
  }, [combo]);

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
              Ticket Prices
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Daily ticket pricing for Universal Orlando
            </p>
          </div>
          <FilterGroup
            options={COMBO_OPTIONS}
            value={combo}
            onChange={setCombo}
            activeColor="bg-emerald-500"
          />
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Ticket className="h-4 w-4 text-emerald-500" />
              {COMBO_OPTIONS.find((o) => o.value === combo)?.label || combo} Ticket
              Prices — Next 30 Days
            </CardTitle>
            <CardDescription>
              Prices are scraped daily. Green = value, yellow = average, red = peak.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7">
                {Array.from({ length: 14 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : prices.length === 0 ? (
              <EmptyState
                icon={Ticket}
                iconColor="text-emerald-400"
                title="No pricing data yet"
                description="Run the scraper to populate ticket pricing data for Universal Orlando."
              />
            ) : (
              <StaggerContainer className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7">
                {prices.map((p) => {
                  const adult = parseFloat(p.adultPrice);
                  const child = parseFloat(p.childPrice);
                  return (
                    <StaggerItem key={p.id}>
                      <div className="rounded-2xl bg-stone-50 p-3 text-center transition-all duration-200 hover:bg-stone-100 dark:bg-stone-800/50 dark:hover:bg-stone-800">
                        <p className="text-xs font-medium text-text-secondary">
                          {formatDate(p.date)}
                        </p>
                        <p className={`text-lg font-extrabold ${priceColor(adult)}`}>
                          ${adult.toFixed(0)}
                        </p>
                        {!isNaN(child) && child > 0 && (
                          <p className="text-[10px] text-text-secondary">
                            Child ${child.toFixed(0)}
                          </p>
                        )}
                        {p.tier && (
                          <Badge variant="tickets" className="mt-1 text-[10px]">
                            {p.tier}
                          </Badge>
                        )}
                      </div>
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
```

Key changes:
- Uses `FilterGroup` instead of inline filter buttons
- `FadeIn` and `StaggerContainer`/`StaggerItem` for animations
- `Skeleton` shimmer loading instead of text spinner
- `EmptyState` component for empty data
- `font-display` Nunito headings
- Design tokens throughout (text-foreground, text-text-secondary)
- `rounded-2xl` price cards with warm stone background
- `Badge variant="tickets"` for section-colored badges
- `gap-2` → `gap-3` for more breathing room

**Step 2: Verify the app builds**

```bash
pnpm build
```

Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/app/tickets/client.tsx
git commit -m "feat: redesign Tickets page with FilterGroup, animations, skeletons"
```

---

### Task 15: Update Attractions page with design system

**Files:**
- Modify: `src/app/attractions/client.tsx`

**Step 1: Replace attractions/client.tsx with the new design**

Replace the entire contents of `src/app/attractions/client.tsx` with:

```tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ParkSelector, type ParkId } from "@/components/park-selector";
import { SearchInput } from "@/components/search-input";
import { EmptyState } from "@/components/empty-state";
import { FadeIn, StaggerContainer, StaggerItem, Skeleton } from "@/components/motion";
import { FerrisWheel, Search, Zap, Ruler } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface Attraction {
  id: number;
  parkId: string;
  name: string;
  slug: string;
  type: string | null;
  area: string | null;
  heightReqIn: number | null;
  expressEligible: boolean;
  description: string | null;
  imageUrl: string | null;
}

const PARK_NAMES: Record<string, string> = {
  usf: "Universal Studios",
  ioa: "Islands of Adventure",
  epic: "Epic Universe",
};

export default function Client() {
  const searchParams = useSearchParams();
  const [selectedPark, setSelectedPark] = useState<ParkId>(
    () => (searchParams.get("park") as ParkId) || "all"
  );
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedPark !== "all") params.set("park", selectedPark);

    fetch(`/api/attractions?${params}`)
      .then((r) => r.json())
      .then((json) => setAttractions(json.data || []))
      .catch(() => setAttractions([]))
      .finally(() => setLoading(false));
  }, [selectedPark]);

  const filtered = search
    ? attractions.filter(
        (a) =>
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.area?.toLowerCase().includes(search.toLowerCase())
      )
    : attractions;

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
              Attractions
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              {loading
                ? "Rides, shows, and experiences"
                : `${filtered.length} ride${filtered.length !== 1 ? "s" : ""}, shows, and experiences`}
            </p>
          </div>
          <ParkSelector selected={selectedPark} onChange={setSelectedPark} />
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search attractions..."
        />
      </FadeIn>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 && attractions.length === 0 ? (
        <EmptyState
          icon={FerrisWheel}
          iconColor="text-sky-400"
          title="No attractions yet"
          description="Run the scraper to populate attraction data for all Universal Orlando parks."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          iconColor="text-stone-400"
          title="No matches found"
          description={`No attractions match "${search}" — try a different search term or clear the filter.`}
        />
      ) : (
        <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((attraction) => (
            <StaggerItem key={attraction.id}>
              <Card className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm leading-tight">
                      {attraction.name}
                    </CardTitle>
                    {attraction.type && (
                      <Badge variant="attractions" className="shrink-0 text-[10px]">
                        {attraction.type}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs">
                    {PARK_NAMES[attraction.parkId] || attraction.parkId}
                    {attraction.area && ` · ${attraction.area}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {attraction.expressEligible && (
                      <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                        <Zap className="h-3 w-3" />
                        Express
                      </div>
                    )}
                    {attraction.heightReqIn && (
                      <div className="flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700 dark:bg-sky-900/20 dark:text-sky-400">
                        <Ruler className="h-3 w-3" />
                        {attraction.heightReqIn}&quot; min
                      </div>
                    )}
                  </div>
                  {attraction.description && (
                    <p className="mt-2 line-clamp-2 text-xs text-text-secondary">
                      {attraction.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </div>
  );
}
```

Key changes:
- Uses `SearchInput` component instead of inline search
- Uses `EmptyState` component for empty/no-match states
- `FadeIn` wrapper for header and search
- `StaggerContainer`/`StaggerItem` for card grid
- `Skeleton` shimmer loading
- `Badge variant="attractions"` for section-colored type badges
- `rounded-md` → `rounded-full` on Express/height badges
- `font-medium` → `font-semibold` on detail badges
- Design tokens throughout

**Step 2: Verify the app builds**

```bash
pnpm build
```

Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/app/attractions/client.tsx
git commit -m "feat: redesign Attractions page with SearchInput, EmptyState, animations"
```

---

### Task 16: Update remaining pages (Dining, Hours, Wait Times, Hotels, Events)

Each of these pages follows the same pattern as Tickets and Attractions. Apply the design system consistently:

**Files:**
- Modify: `src/app/dining/client.tsx`
- Modify: `src/app/hours/client.tsx`
- Modify: `src/app/wait-times/client.tsx`
- Modify: `src/app/hotels/client.tsx`
- Modify: `src/app/events/client.tsx`

**For each page, apply these changes:**

1. **Imports:** Add `FadeIn, StaggerContainer, StaggerItem, Skeleton` from `@/components/motion`, `EmptyState` from `@/components/empty-state`, `SearchInput` from `@/components/search-input` (where applicable), `FilterGroup` from `@/components/filter-group` (where applicable)

2. **Headings:** Change to `font-display text-3xl font-extrabold tracking-tight text-foreground`

3. **Subheadings:** Change to `text-sm text-text-secondary` (with `mt-1`)

4. **Filter buttons:** Replace inline filter groups with `<FilterGroup>` component. Use section-appropriate `activeColor`:
   - Dining: `bg-orange-500`
   - Hours: `bg-violet-500`
   - Wait Times: `bg-rose-500`
   - Hotels: `bg-amber-500`
   - Events: `bg-fuchsia-500`

5. **Search inputs:** Replace inline search with `<SearchInput>` component

6. **Loading states:** Replace text spinners with `<Skeleton>` shimmer components

7. **Empty states:** Replace inline empty divs with `<EmptyState>` component using section-appropriate icon and color

8. **Animations:** Wrap page header in `<FadeIn>`, wrap card grids in `<StaggerContainer>`/`<StaggerItem>`

9. **Colors:** Replace all `zinc-*` classes with `stone-*` equivalents. Use design tokens (`text-foreground`, `text-text-secondary`, `bg-surface`, `border-border`)

10. **Badges:** Use section-appropriate Badge variants where applicable

11. **Border radius:** Update any `rounded-md` to `rounded-full` for pill-shaped elements, `rounded-2xl` for cards

**Step 1:** Read each client.tsx file, apply the changes above

Read each file with `git show claude/add-codebase-docs-FLhKv:src/app/<section>/client.tsx` first, then apply the design system transformation following the patterns established in Tasks 14 and 15.

**Step 2: Verify the app builds after each page**

```bash
pnpm build
```

Expected: Build succeeds after each page update.

**Step 3: Commit after each page**

```bash
git add src/app/<section>/client.tsx
git commit -m "feat: redesign <Section> page with design system"
```

---

### Task 17: Update error.tsx and not-found.tsx with design system

**Files:**
- Modify: `src/app/error.tsx`
- Modify: `src/app/not-found.tsx`

**Step 1:** Read current files, update to use:
- `font-display` for headings
- Warm stone colors instead of zinc
- `rounded-2xl` cards
- Design tokens (`text-foreground`, `text-text-secondary`)
- `FadeIn` animation wrapper
- Friendly, encouraging copy

**Step 2: Verify and commit**

```bash
pnpm build
git add src/app/error.tsx src/app/not-found.tsx
git commit -m "feat: update error and not-found pages with design system"
```

---

## Phase 5: Final Polish

### Task 18: Add footer component

**Files:**
- Create: `src/components/footer.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: Create footer.tsx**

Create `src/components/footer.tsx`:

```tsx
export function Footer() {
  return (
    <footer className="mt-16 border-t border-border py-8">
      <div className="mx-auto max-w-6xl px-4 text-center text-sm text-text-secondary sm:px-6 lg:px-8">
        <p>Built for Universal Orlando fans</p>
      </div>
    </footer>
  );
}
```

**Step 2: Add Footer to layout.tsx**

Import `Footer` and add it after `</main>` in layout.tsx:

```tsx
import { Footer } from "@/components/footer";
```

```tsx
</main>
<Footer />
```

**Step 3: Verify and commit**

```bash
pnpm build
git add src/components/footer.tsx src/app/layout.tsx
git commit -m "feat: add minimal warm footer"
```

---

### Task 19: Visual QA and build verification

**Step 1: Run full build**

```bash
pnpm build
```

Expected: Build succeeds with zero errors.

**Step 2: Start dev server and test**

```bash
pnpm dev
```

Visit each page and verify:
- Warm off-white background (not sterile white)
- Nunito headings render correctly
- Cards have warm shadows and hover lift effect
- Filter pills animate smoothly
- Section colors are correct per page
- Mobile nav drawer opens/closes
- Skeleton loading appears during data fetch
- Empty states show friendly messages
- Staggered animations play on page load

**Step 3: Fix any visual issues found during QA**

**Step 4: Final commit**

```bash
git add -A
git commit -m "fix: visual QA fixes and polish"
```

---

## Summary

| Phase | Tasks | Focus |
|-------|-------|-------|
| Prerequisites | 0 | Merge source code |
| Phase 1 | 1-10 | Design system foundation (tokens, components, animations) |
| Phase 2 | 11-12 | Layout & navigation |
| Phase 3 | 13 | Homepage redesign |
| Phase 4 | 14-17 | Content page redesigns |
| Phase 5 | 18-19 | Footer & polish |

**Total tasks:** 20
**New files:** 5 (`filter-group.tsx`, `motion.tsx`, `search-input.tsx`, `empty-state.tsx`, `home-client.tsx`, `footer.tsx`)
**Modified files:** 11 (`globals.css`, `layout.tsx`, `page.tsx`, `nav.tsx`, `card.tsx`, `badge.tsx`, `button.tsx`, `park-selector.tsx`, + 5 page client components, `error.tsx`, `not-found.tsx`)
**New dependency:** `framer-motion`
