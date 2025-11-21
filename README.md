# Universal-Planner-Pro
# Universal Orlando API

A fully custom API that scrapes Universal Orlando’s public website and normalizes
the data into a clean JSON API. It serves all available and scrapable data from Universal Orlando in a beautiful and clean dashboard interface.

## Features
- Ticket & Express dynamic daily pricing
- Event & holiday pricing (Grinch Breakfast, HHN, Holidays, Mardi Gras)
- Attraction metadata (height, accessibility, express eligibility)
- Dining database with menu links
- Park hours
- Daily scraping cron jobs
- Clean REST API for consumption

## Tech Stack
- Node.js + TypeScript
- Express
- PostgreSQL (Supabase/Neon recommended)
- Playwright for scraping dynamic content
- Redis caching (optional)
- Dockerized for easy deployment

## Setup

Copy `.env.example` → `.env`

```
pnpm install
pnpm build
pnpm dev
```

## Scripts

```
pnpm scrape     # run all scrapers
pnpm migrate    # run database migrations
pnpm start      # run in production mode
```

## Folder Docs
See `/docs` for detailed architecture, schema, endpoint map, and scraper instructions.
