# Universal Planner Pro — Implementation Plan

## Project Summary

A polished, public-facing trip-planning dashboard for Universal Orlando that scrapes park data daily and presents it in a clean UI. The dashboard **is** the product — no separate mobile app or external consumers.

---

## Architecture Decision: Why Next.js Does Everything

Since the dashboard IS the app and budget is $0, we collapse the entire stack into **one Next.js project**:

```
┌─────────────────────────────────────────────────┐
│                   Vercel (Free)                  │
│  ┌───────────────────────────────────────────┐   │
│  │            Next.js App                    │   │
│  │  ┌─────────────┐  ┌───────────────────┐   │   │
│  │  │  Pages/UI    │  │  API Routes       │   │   │
│  │  │  (React SSR) │  │  /api/tickets     │   │   │
│  │  │              │  │  /api/attractions  │   │   │
│  │  │              │  │  /api/dining       │   │   │
│  │  │              │  │  /api/hours        │   │   │
│  │  └─────────────┘  └───────────────────┘   │   │
│  └───────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
         │                          │
         │ Drizzle ORM              │ fetch()
         ▼                          ▼
┌─────────────────┐    ┌─────────────────────────┐
│  Neon PostgreSQL │    │  GitHub Actions (Free)   │
│  (Free Tier)     │    │  Daily cron → scrape     │
│  0.5 GB storage  │    │  Playwright + Cheerio    │
│  190 compute hrs │    │  Writes to Neon DB       │
└─────────────────┘    └─────────────────────────┘
```

**Why this beats the original Express + separate frontend plan:**
- One codebase, one deploy, one framework
- Vercel free tier handles hosting (100 GB bandwidth, serverless functions)
- SSR means great SEO (Google indexes park data pages)
- API routes replace Express entirely
- No Docker needed — Vercel handles deployment
- No Redis needed — Next.js has built-in `unstable_cache` + ISR (Incremental Static Regeneration)

---

## Final Tech Stack

| Layer | Tool | Why |
|-------|------|-----|
| **Framework** | Next.js 15 (App Router) | Full-stack React, free Vercel hosting, SSR, API routes |
| **Language** | TypeScript | Type safety across the entire stack |
| **Database** | Neon PostgreSQL (free tier) | Serverless Postgres, generous free tier, branches for dev |
| **ORM** | Drizzle ORM + drizzle-kit | Type-safe, lightweight, built-in migrations |
| **Scraping (fast)** | Cheerio + undici | For static HTML pages — park hours, attraction lists |
| **Scraping (dynamic)** | Playwright | For JS-rendered pages — pricing calendars, dynamic content |
| **Scheduling** | GitHub Actions (cron) | Free compute for daily scrape jobs |
| **Styling** | Tailwind CSS + shadcn/ui | Beautiful components, zero runtime cost |
| **Validation** | Zod | Runtime validation of scraped data, API params |
| **Charts** | Recharts | Price history graphs, trends |
| **Testing** | Vitest + Playwright (E2E) | Fast unit tests + browser testing |
| **Logging** | pino | Structured logging for scraper debugging |
| **Package Manager** | pnpm | Fast, disk-efficient |

### Free Tier Budget Breakdown

| Service | Free Tier | Our Usage |
|---------|-----------|-----------|
| **Vercel** | 100 GB bandwidth, serverless functions | Dashboard + API |
| **Neon** | 0.5 GB storage, 190 compute hours/month | All park data |
| **GitHub Actions** | 2,000 min/month (private) or unlimited (public) | Daily scrape cron |
| **Total** | **$0/month** | |

---

## Folder Structure

```
Universal-Planner-Pro/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout (nav, footer, theme)
│   │   ├── page.tsx            # Homepage / landing
│   │   ├── tickets/
│   │   │   └── page.tsx        # Ticket pricing dashboard
│   │   ├── attractions/
│   │   │   ├── page.tsx        # All attractions list
│   │   │   └── [slug]/
│   │   │       └── page.tsx    # Individual attraction detail
│   │   ├── dining/
│   │   │   └── page.tsx        # Restaurant listings
│   │   ├── hours/
│   │   │   └── page.tsx        # Park hours calendar
│   │   ├── hotels/
│   │   │   └── page.tsx        # Hotel pricing
│   │   └── api/                # API routes (REST endpoints)
│   │       ├── tickets/
│   │       │   └── route.ts
│   │       ├── attractions/
│   │       │   └── route.ts
│   │       ├── dining/
│   │       │   └── route.ts
│   │       ├── hours/
│   │       │   └── route.ts
│   │       └── hotels/
│   │           └── route.ts
│   ├── components/             # Shared React components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── price-calendar.tsx  # Pricing calendar widget
│   │   ├── park-selector.tsx   # Park toggle (IOA / USF / Epic)
│   │   └── ...
│   ├── lib/                    # Shared utilities
│   │   ├── db/
│   │   │   ├── index.ts        # Drizzle client
│   │   │   ├── schema.ts       # Drizzle schema definitions
│   │   │   └── migrations/     # SQL migration files
│   │   ├── validators/         # Zod schemas
│   │   └── utils.ts
│   └── scrapers/               # All scraping logic
│       ├── runner.ts           # Scraper orchestrator
│       ├── tickets.ts          # Ticket price scraper
│       ├── attractions.ts      # Attraction metadata scraper
│       ├── dining.ts           # Dining/restaurant scraper
│       ├── hours.ts            # Park hours scraper
│       ├── hotels.ts           # Hotel pricing scraper
│       └── helpers/
│           ├── browser.ts      # Playwright browser setup
│           └── parser.ts       # HTML parsing utilities
├── .github/
│   └── workflows/
│       └── scrape.yml          # Daily cron job
├── drizzle.config.ts           # Drizzle Kit configuration
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json
├── package.json
├── .env.example
├── .gitignore
└── docs/
    ├── IMPLEMENTATION_PLAN.md  # This file
    ├── DATABASE_SCHEMA.md      # Table designs
    ├── SCRAPER_GUIDE.md        # How each scraper works
    └── API_ENDPOINTS.md        # REST API documentation
```

---

## Database Schema (PostgreSQL / Drizzle)

### Core Tables

```sql
-- Which park a record belongs to
-- 'ioa' = Islands of Adventure
-- 'usf' = Universal Studios Florida
-- 'epic' = Epic Universe

-- Parks
CREATE TABLE parks (
  id          TEXT PRIMARY KEY,          -- 'ioa', 'usf', 'epic'
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE
);

-- Daily ticket pricing (one row per date per ticket type)
CREATE TABLE ticket_prices (
  id          SERIAL PRIMARY KEY,
  date        DATE NOT NULL,
  park_combo  TEXT NOT NULL,             -- '1-park', '2-park', '3-park'
  tier        TEXT,                      -- pricing tier if applicable
  adult_price DECIMAL(8,2),
  child_price DECIMAL(8,2),
  scraped_at  TIMESTAMP DEFAULT NOW(),
  UNIQUE(date, park_combo, tier)
);

-- Express pass daily pricing
CREATE TABLE express_prices (
  id          SERIAL PRIMARY KEY,
  date        DATE NOT NULL,
  pass_type   TEXT NOT NULL,             -- 'express', 'express-unlimited'
  park_id     TEXT REFERENCES parks(id),
  price       DECIMAL(8,2),
  scraped_at  TIMESTAMP DEFAULT NOW(),
  UNIQUE(date, pass_type, park_id)
);

-- Attractions / rides
CREATE TABLE attractions (
  id              SERIAL PRIMARY KEY,
  park_id         TEXT REFERENCES parks(id),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  type            TEXT,                  -- 'ride', 'show', 'experience'
  area            TEXT,                  -- themed land/area
  height_req_in   INTEGER,              -- min height in inches
  express_eligible BOOLEAN DEFAULT false,
  accessibility   JSONB,                -- wheelchair, transfer, etc.
  description     TEXT,
  image_url       TEXT,
  scraped_at      TIMESTAMP DEFAULT NOW()
);

-- Dining / restaurants
CREATE TABLE dining (
  id          SERIAL PRIMARY KEY,
  park_id     TEXT REFERENCES parks(id),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  type        TEXT,                      -- 'quick-service', 'table-service', 'cart'
  area        TEXT,
  cuisine     TEXT,
  menu_url    TEXT,
  image_url   TEXT,
  scraped_at  TIMESTAMP DEFAULT NOW()
);

-- Park operating hours
CREATE TABLE park_hours (
  id          SERIAL PRIMARY KEY,
  park_id     TEXT REFERENCES parks(id),
  date        DATE NOT NULL,
  open_time   TIME,
  close_time  TIME,
  early_entry TIME,                     -- hotel guest early entry
  event_name  TEXT,                     -- 'HHN', 'Holidays', etc.
  event_start TIME,
  event_end   TIME,
  scraped_at  TIMESTAMP DEFAULT NOW(),
  UNIQUE(park_id, date)
);

-- Special events (HHN, Mardi Gras, Holidays, etc.)
CREATE TABLE events (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  start_date  DATE,
  end_date    DATE,
  description TEXT,
  scraped_at  TIMESTAMP DEFAULT NOW()
);

-- Event-specific pricing (per date)
CREATE TABLE event_prices (
  id          SERIAL PRIMARY KEY,
  event_id    INTEGER REFERENCES events(id),
  date        DATE NOT NULL,
  ticket_type TEXT,                      -- 'general', 'frequent-fear', 'rush-of-fear'
  price       DECIMAL(8,2),
  scraped_at  TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, date, ticket_type)
);

-- Hotels
CREATE TABLE hotels (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  tier        TEXT,                      -- 'premier', 'preferred', 'prime-value', 'value'
  perks       JSONB,                    -- early entry, express included, etc.
  image_url   TEXT,
  scraped_at  TIMESTAMP DEFAULT NOW()
);

-- Hotel room pricing (per date per room type)
CREATE TABLE hotel_prices (
  id          SERIAL PRIMARY KEY,
  hotel_id    INTEGER REFERENCES hotels(id),
  date        DATE NOT NULL,
  room_type   TEXT NOT NULL,
  price       DECIMAL(8,2),
  scraped_at  TIMESTAMP DEFAULT NOW(),
  UNIQUE(hotel_id, date, room_type)
);

-- Scrape run log (for monitoring scraper health)
CREATE TABLE scrape_runs (
  id          SERIAL PRIMARY KEY,
  scraper     TEXT NOT NULL,             -- 'tickets', 'attractions', etc.
  status      TEXT NOT NULL,             -- 'success', 'partial', 'failed'
  rows_upserted INTEGER DEFAULT 0,
  error_message TEXT,
  started_at  TIMESTAMP NOT NULL,
  finished_at TIMESTAMP
);
```

---

## Implementation Phases

### Phase 1: Project Foundation (Week 1)
> Get the skeleton running, deployable to Vercel on day 1.

- [ ] Initialize Next.js 15 project with TypeScript, Tailwind, pnpm
- [ ] Set up Drizzle ORM + Neon database connection
- [ ] Create database schema + run initial migration
- [ ] Set up project structure (folders, configs, .env.example)
- [ ] Configure shadcn/ui component library
- [ ] Create root layout with navigation shell (park selector, nav links)
- [ ] Deploy skeleton to Vercel (confirm it works)
- [ ] Set up .gitignore, ESLint, Prettier

**Deliverable:** Empty dashboard shell deployed to Vercel, connected to Neon DB.

---

### Phase 2: Core Scrapers (Week 2-3)
> Build the data pipeline. Most critical — without data, there's no product.

- [ ] Build scraper runner/orchestrator (`src/scrapers/runner.ts`)
- [ ] Build Playwright browser helper (shared browser instance, stealth config)
- [ ] **Ticket price scraper** — scrape daily pricing calendar
  - Determine if Universal's pricing page is static HTML or JS-rendered
  - Build Cheerio or Playwright scraper accordingly
  - Validate scraped data with Zod before DB insert
  - Upsert into `ticket_prices` table
- [ ] **Express pass scraper** — similar flow, `express_prices` table
- [ ] **Attractions scraper** — ride/show metadata
- [ ] **Dining scraper** — restaurant data
- [ ] **Park hours scraper** — operating hours calendar
- [ ] **Scrape logging** — record each run in `scrape_runs` table
- [ ] Set up GitHub Actions workflow (`scrape.yml`) for daily cron
  - Run at ~6 AM EST (before park opens)
  - Install Playwright browsers in CI
  - Connect to Neon DB via env secret
- [ ] Add Zod validation schemas for all scraped data

**Deliverable:** All 5 core scrapers running daily via GitHub Actions, data flowing into Neon.

---

### Phase 3: API Routes (Week 3)
> Expose the scraped data as clean JSON endpoints.

- [ ] `GET /api/tickets?date=YYYY-MM-DD&range=30` — ticket pricing
- [ ] `GET /api/express?date=YYYY-MM-DD&park=epic` — express pricing
- [ ] `GET /api/attractions?park=ioa&type=ride` — attraction listings
- [ ] `GET /api/attractions/[slug]` — single attraction detail
- [ ] `GET /api/dining?park=usf&type=table-service` — dining listings
- [ ] `GET /api/hours?park=epic&month=2026-03` — park hours
- [ ] Add Zod validation for query parameters
- [ ] Add proper error responses (400, 404, 500)
- [ ] Add cache headers (`Cache-Control`, `stale-while-revalidate`)

**Deliverable:** Fully functional REST API. Test with curl/Postman.

---

### Phase 4: Dashboard UI (Week 4-5)
> The product — what users actually see.

- [ ] **Homepage** — overview cards for each park, today's hours, price snapshot
- [ ] **Ticket pricing page**
  - Interactive calendar showing prices by date
  - Color-coded price tiers (green = cheap, red = expensive)
  - Toggle between 1-park / 2-park / 3-park
  - Adult vs child pricing
  - Price trend chart (Recharts)
- [ ] **Express pricing page** — similar calendar view
- [ ] **Attractions page**
  - Filterable grid/list of all rides
  - Filter by park, type, height requirement, express eligible
  - Search by name
- [ ] **Attraction detail page** — individual ride info with all metadata
- [ ] **Dining page**
  - Restaurant listings with filters (park, cuisine, type)
  - Link to menus
- [ ] **Park hours page**
  - Monthly calendar view
  - Shows open/close, early entry, special events
- [ ] **Mobile responsive design** — many users will be in the parks on their phones
- [ ] Dark mode support (Tailwind dark: classes)

**Deliverable:** Polished, responsive dashboard with all core data pages.

---

### Phase 5: Hotels & Packages (Week 5-6)
> Expand to hotel data.

- [ ] **Hotel scraper** — property metadata + daily room pricing
- [ ] **Hotel pricing page**
  - Calendar view of prices per hotel
  - Compare hotels side-by-side
  - Highlight which tier gets Express Pass included
- [ ] Add hotel scraper to GitHub Actions cron
- [ ] Seed hotel metadata (name, tier, perks)

**Deliverable:** Hotel pricing tracker live on the dashboard.

---

### Phase 6: Events & Special Pricing (Week 6-7)
> HHN, Mardi Gras, Holidays, Grinch Breakfast, etc.

- [ ] **Event scraper** — event dates, pricing, descriptions
- [ ] **Events page** — upcoming events with pricing calendars
- [ ] **Event-specific pricing** — per-date pricing comparison
- [ ] Integrate events into park hours calendar (show event nights)

**Deliverable:** Full events section with pricing.

---

### Phase 7: Wait Times — Opportunistic (Week 7+)
> Only if a viable data source exists.

- [ ] Research Universal's wait time data sources:
  - Check if Universal's mobile app has a public API
  - Look for third-party APIs (Queue-Times.com, ThemeParks.wiki API)
  - Check if the Universal website has a wait times endpoint
- [ ] If a free, reliable source exists:
  - Build a lightweight scraper/API consumer
  - Add a "Current Wait Times" page with live-ish data
  - Use Next.js ISR to refresh every 5 minutes
- [ ] If no easy source: skip entirely, document why

**Deliverable:** Wait times page if feasible, or a documented decision to skip.

---

### Phase 8: Polish & Launch (Week 8)
> Production readiness.

- [ ] SEO optimization — meta tags, Open Graph, structured data (schema.org)
- [ ] Performance audit — Lighthouse score, Core Web Vitals
- [ ] Error handling — graceful fallbacks when data is missing
- [ ] Scraper health dashboard — internal page showing last run status
- [ ] 404 page, loading states, empty states
- [ ] Favicon, social preview image
- [ ] Final Vercel production deploy with custom domain (if desired)

---

## GitHub Actions Scrape Workflow

```yaml
# .github/workflows/scrape.yml
name: Daily Scrape

on:
  schedule:
    - cron: '0 11 * * *'    # 6 AM EST (11 UTC) daily
  workflow_dispatch:          # Allow manual triggers

jobs:
  scrape:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install

      - run: pnpm exec playwright install chromium --with-deps

      - run: pnpm scrape
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - name: Notify on failure
        if: failure()
        run: echo "::warning::Scrape job failed! Check logs."
```

---

## Environment Variables

```bash
# .env.example

# Neon PostgreSQL connection string
DATABASE_URL="postgresql://user:pass@ep-cool-name-123456.us-east-2.aws.neon.tech/universal_planner?sslmode=require"

# Optional: Only needed if you add error monitoring later
# SENTRY_DSN="https://..."

# Next.js
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

---

## Key Design Decisions & Tradeoffs

| Decision | Rationale |
|----------|-----------|
| Next.js instead of Express + SPA | One framework, one deploy, free hosting, SSR for SEO |
| Neon instead of Supabase | Simpler (just Postgres, no extra SDK), better free tier for this use case |
| Drizzle instead of Prisma | Lighter, faster cold starts (matters on serverless), SQL-like syntax |
| GitHub Actions instead of node-cron | Free compute, no always-on server needed, built-in logs |
| shadcn/ui instead of MUI/Chakra | Copy-paste components (no dependency bloat), beautiful defaults, Tailwind-native |
| No Redis | Data updates once/day — ISR + in-memory cache is sufficient for $0 budget |
| No Docker | Vercel handles deployment — Docker adds complexity with no benefit here |
| Monolithic (no monorepo) | Dashboard IS the app — no need for separate packages |

---

## Wait Times: Research Notes

Potential free data sources to investigate in Phase 7:
1. **ThemeParks.wiki API** — open-source, community-maintained, may have Universal data
2. **Queue-Times.com** — free tier API, has Universal parks
3. **Universal Orlando app** — reverse-engineer the mobile app's API calls
4. **Universal website** — check for hidden XHR/fetch calls on the wait times page

If any of these provide reliable, free data, we can add a lightweight consumer that runs every 5-15 minutes via ISR or a separate GitHub Action.
