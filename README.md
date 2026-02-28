# Universal Planner Pro

A polished dashboard and API for tracking Universal Orlando ticket prices, park hours, attractions, dining, hotels, and special events. Data is scraped daily and served through a clean Next.js app.

## Features

- Ticket & Express Pass dynamic daily pricing
- Event & holiday pricing (HHN, Mardi Gras, Holidays, Grinch Breakfast)
- Attraction metadata (height requirements, accessibility, Express eligibility)
- Dining database with menu links
- Hotel pricing comparison by tier
- Park hours with early entry and event schedules
- Daily scraping via GitHub Actions
- REST API with caching headers
- Responsive dashboard with dark mode

## Tech Stack

- **Framework:** Next.js 15 (App Router, SSR)
- **Language:** TypeScript
- **Database:** PostgreSQL via Neon (serverless)
- **ORM:** Drizzle ORM
- **Scraping:** Cheerio (static) + Playwright (dynamic)
- **Styling:** Tailwind CSS v4 + shadcn/ui components
- **Validation:** Zod
- **Scheduling:** GitHub Actions cron
- **Hosting:** Vercel (free tier)

## Setup

```bash
cp .env.example .env
# Edit .env with your Neon database URL

pnpm install
pnpm db:push        # push schema to database
pnpm dev             # start dev server
```

## Scripts

```bash
pnpm dev             # start dev server (Turbopack)
pnpm build           # production build
pnpm start           # run production server
pnpm lint            # run ESLint
pnpm scrape          # run all scrapers
pnpm db:generate     # generate migration files
pnpm db:migrate      # run migrations
pnpm db:push         # push schema directly to DB
pnpm db:studio       # open Drizzle Studio (DB browser)
```

## Project Structure

```
src/
├── app/                 # Next.js App Router (pages + API routes)
│   ├── api/             # REST API endpoints
│   ├── tickets/         # Ticket pricing page
│   ├── attractions/     # Attractions listing
│   ├── dining/          # Dining listings
│   ├── hours/           # Park hours calendar
│   ├── hotels/          # Hotel pricing
│   └── events/          # Special events
├── components/          # React components
│   └── ui/              # Base UI components (button, card, badge)
├── lib/                 # Shared utilities
│   ├── db/              # Drizzle schema + client
│   └── validators/      # Zod schemas for scraped data
└── scrapers/            # Scraping logic
    └── helpers/         # Browser setup + parsing utils
```

## Docs

See [`/docs`](./docs/) for the full implementation plan, database schema, and architecture.
