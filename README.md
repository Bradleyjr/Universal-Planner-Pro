# Universal-Planner-Pro

Universal Planner Pro is a custom API that scrapes Universal Orlando’s public website and normalizes the data into a clean JSON API. It is the backend for a dashboard that surfaces park ticket pricing, attraction metadata, dining information, and park hours in one place.

This repo now includes a live, browser-based dashboard that sits on top of the API. Launch it and you will see park ticket quotes, hotel totals, Express pass options, park hours, dining callouts, and marquee events with beautiful presentation and live filter controls.

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

## Getting Started

1. Install dependencies
   ```bash
   pnpm install
   ```
2. Copy `.env.example` to `.env` and adjust values as needed
   ```bash
   cp .env.example .env
   ```
3. Start the dev server with hot reload
   ```bash
   pnpm dev
   ```

The API boots on the port defined by `PORT` in your `.env` file (defaults to `4000`). A quick health check lives at `/health`.

The dashboard is served at `/` and talks to the API at `/api/*` under the same origin.

## Scripts

```bash
pnpm dev      # run the server with hot reload
pnpm build    # compile TypeScript into dist/
pnpm start    # run the compiled server
```

## Folder Docs
See `/docs` for detailed architecture, schema, endpoint map, and scraper instructions.

## API routes

- `GET /api/summary` — counts of tickets, hotels, express options, dining, and events
- `GET /api/tickets?days=2&adults=2&children=0` — ticket quotes with taxes/fees math applied
- `GET /api/hotels?nights=2&guests=2` — hotel pricing with resort and housekeeping fees
- `GET /api/express` — Express pass catalog
- `GET /api/park-hours` — operating hours with early admission flag and events
- `GET /api/dining` — dining list with cuisine, meal, reservation tips
- `GET /api/events` — headline and seasonal events

Hit the root path `/` to explore the full UI with filterable sections and pricing cards.
