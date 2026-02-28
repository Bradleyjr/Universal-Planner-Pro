# "Sunny Day Out" Design System for Universal Planner Pro

**Date:** 2026-02-28
**Status:** Approved
**Approach:** Design system first, then incremental page application
**Mood:** Vibrant & playful — Linear meets theme park
**Inspiration:** Playful SaaS products (Linear, Notion, Amie)

## Problem Statement

The current UI is functional and clean but feels generic and template-like. It uses default zinc/shadcn patterns with no personality, no animations, and no visual delight. For a Universal Orlando trip-planning app, users should feel excitement and anticipation — not like they're using a corporate dashboard.

Key issues:
- Generic zinc color palette (indistinguishable from Vercel/Supabase templates)
- No animations or micro-interactions
- Copy-pasted filter groups across 8 pages (no component abstraction)
- No brand identity (text-only logo, no illustrations, no park theming)
- Information overload with no visual hierarchy

## Color System

### Base Palette
| Token          | Light Mode  | Dark Mode   | Usage                        |
|----------------|-------------|-------------|------------------------------|
| Background     | `#FDFBF7`   | stone-950   | Page background              |
| Surface        | `#FFFFFF`   | stone-900   | Cards, elevated elements     |
| Text primary   | `#1C1917`   | stone-100   | Headings, body text          |
| Text secondary | `#78716C`   | stone-400   | Labels, metadata             |
| Border         | `#E7E5E4`   | stone-800   | Subtle separators            |

### Section Accent Colors
| Section      | Color    | Hex       | Usage                              |
|--------------|----------|-----------|------------------------------------|
| Tickets      | Emerald  | `#10B981` | Badges, price highlights           |
| Attractions  | Sky Blue | `#0EA5E9` | Cards, icons, ride tags            |
| Dining       | Orange   | `#F97316` | Food icons, restaurant cards       |
| Park Hours   | Violet   | `#8B5CF6` | Calendar highlights, time badges   |
| Wait Times   | Rose     | `#F43F5E` | Wait indicators, urgency signals   |
| Hotels       | Amber    | `#F59E0B` | Star ratings, price tiers          |
| Events       | Fuchsia  | `#D946EF` | Event badges, special highlights   |

### Gradient Usage
- Section header backgrounds: white to tinted section color (e.g., white -> emerald-50)
- Homepage section cards: soft gradient border in section color
- CTA buttons: solid saturated color (no gradient)

## Typography

### Font Stack
- **Display (h1, h2, h3):** Nunito (Google Fonts) — rounded geometric, warm, friendly
- **Body/UI:** Geist Sans (current) — clean, modern, excellent readability
- **Monospace:** Geist Mono (unchanged)

### Scale
| Element        | Font     | Weight      | Size                    | Extras            |
|----------------|----------|-------------|-------------------------|-------------------|
| Page title     | Nunito   | extrabold   | text-3xl / text-4xl     | tracking-tight    |
| Section head   | Nunito   | bold        | text-xl                 | tracking-tight    |
| Subsection     | Nunito   | bold        | text-lg                 |                   |
| Body           | Geist    | normal      | text-sm / text-base     |                   |
| Labels/badges  | Geist    | semibold    | text-xs                 | uppercase, tracking-wide |

## Spacing & Shape

### Spacing Philosophy: "Breathe More"
- Card padding: 28-32px (up from 24px)
- Section gaps: 32-40px (up from 24px)
- Grid gaps: 12-16px (up from 8-12px)
- More whitespace between filter groups and content

### Border Radius: "Chunky & Friendly"
- Cards: `rounded-2xl`
- Buttons/badges: `rounded-full` (pill shape)
- Inputs: `rounded-xl`
- Nav elements: `rounded-xl`

### Shadows
- Warm-tinted shadows (stone hue, not pure gray)
- Cards: `shadow-md` at rest
- Cards on hover: `shadow-lg` + subtle lift

## Components

### Cards
- White background, `rounded-2xl`, warm `shadow-md`
- Hover: translateY(-2px) + shadow increase + scale(1.02) + border glow in section color
- Homepage section cards: 4px gradient left-border accent strip
- No hard borders — shadows handle separation

### Filter Pills (New Reusable Component)
- Extract `FilterGroup` component (DRY up 8 pages of copy-pasted filters)
- Active: section color background, white text, `rounded-full`
- Inactive: `stone-100` background, `stone-600` text, `rounded-full`
- Smooth background-color transition on selection
- Pop/scale effect on selection

### Badges
- `rounded-full` pill shape
- Tinted background + darker text (e.g., `bg-sky-100 text-sky-700`)
- Used for: park tags, dietary labels, ride types, pricing tiers

### Buttons
- Primary: solid section color, white text, `rounded-full`
- Hover: darkened shade
- Secondary: tinted background, section-colored text

### Navigation
- Sticky top nav with warm backdrop blur
- Active page: bold colored underline (2px, section color) + bold text
- Nav icons colored when active
- Mobile: slide-out drawer (replacing horizontal scroll)

### Empty States
- Section-colored illustration/icon (larger, more visual)
- Friendly copy (e.g., "No rides matching your search — try a different filter!")
- Suggestion action button

## Animation System (Framer Motion)

### Page & Content
- Page transitions: cross-fade with content sliding up
- Staggered card fade-in on load (0, 50ms, 100ms delay per card)
- Scroll reveal: cards animate up from below as they enter viewport

### Interactive
- Card hover: lift + shadow + scale(1.02) + border glow (200ms ease)
- Filter pill selection: pop/scale effect then settle
- Icon hover: playful wiggle or bounce
- Nav active indicator: sliding underline that glides between items
- Toggle switches: satisfying snap with micro-bounce

### Data
- Skeleton shimmer loading (animated gradient sweep, replacing text spinners)
- Price/number displays: spring-based count-up with slight overshoot
- Confetti/sparkle moments for "best deal" prices or short wait times

### Decorative
- Homepage hero: gentle parallax on floating decorative shapes
- All animations under 300ms for snappiness

## Homepage Design

### Hero Section
- Bold Nunito heading: "Plan Your Perfect Universal Day"
- Warm gradient background (white -> section-tinted)
- Floating decorative shapes (circles, stars) with subtle parallax

### Quick Stats Bar
- Horizontally scrollable pills with today's highlights
- Examples: "Tickets from $109", "Avg wait: 25min", "3 events today"
- Live pulse dot indicator

### Section Grid
- 2x4 responsive grid of section cards
- Each card: animated section icon + Nunito bold name + one-line stat + soft gradient background
- Arrow indicator slides right on hover

## Global Layout

- Sticky nav with warm backdrop blur (`#FDFBF7` at 80% opacity)
- Main content: `max-w-6xl` centered (narrower for readability)
- Footer: minimal, warm stone colors, "Built for Universal Orlando fans"

## Implementation Scope

**Phase 1: Design System Foundation**
Build the tokens, components, and animation primitives. No page rewrites yet.

**Phase 2+: Page-by-Page Application**
Apply the design system incrementally to all 8 pages, starting with the homepage.

## Dependencies
- `framer-motion` — animation library
- `@next/font` or Google Fonts CDN — Nunito font
- Existing: Tailwind CSS v4, shadcn/ui, Lucide icons
