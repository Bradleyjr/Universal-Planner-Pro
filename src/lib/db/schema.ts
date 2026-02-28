import {
  pgTable,
  text,
  serial,
  date,
  time,
  decimal,
  integer,
  boolean,
  timestamp,
  jsonb,
  unique,
} from "drizzle-orm/pg-core";

// ── Parks ──────────────────────────────────────────────────
export const parks = pgTable("parks", {
  id: text("id").primaryKey(), // 'ioa', 'usf', 'epic'
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});

// ── Ticket Prices ──────────────────────────────────────────
export const ticketPrices = pgTable(
  "ticket_prices",
  {
    id: serial("id").primaryKey(),
    date: date("date").notNull(),
    parkCombo: text("park_combo").notNull(), // '1-park', '2-park', '3-park'
    tier: text("tier"),
    adultPrice: decimal("adult_price", { precision: 8, scale: 2 }),
    childPrice: decimal("child_price", { precision: 8, scale: 2 }),
    scrapedAt: timestamp("scraped_at").defaultNow(),
  },
  (t) => [unique().on(t.date, t.parkCombo, t.tier)]
);

// ── Express Pass Prices ────────────────────────────────────
export const expressPrices = pgTable(
  "express_prices",
  {
    id: serial("id").primaryKey(),
    date: date("date").notNull(),
    passType: text("pass_type").notNull(), // 'express', 'express-unlimited'
    parkId: text("park_id").references(() => parks.id),
    price: decimal("price", { precision: 8, scale: 2 }),
    scrapedAt: timestamp("scraped_at").defaultNow(),
  },
  (t) => [unique().on(t.date, t.passType, t.parkId)]
);

// ── Attractions ────────────────────────────────────────────
export const attractions = pgTable("attractions", {
  id: serial("id").primaryKey(),
  parkId: text("park_id").references(() => parks.id),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  type: text("type"), // 'ride', 'show', 'experience'
  area: text("area"), // themed land/area
  heightReqIn: integer("height_req_in"),
  expressEligible: boolean("express_eligible").default(false),
  accessibility: jsonb("accessibility"),
  description: text("description"),
  imageUrl: text("image_url"),
  scrapedAt: timestamp("scraped_at").defaultNow(),
});

// ── Dining ─────────────────────────────────────────────────
export const dining = pgTable("dining", {
  id: serial("id").primaryKey(),
  parkId: text("park_id").references(() => parks.id),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  type: text("type"), // 'quick-service', 'table-service', 'cart'
  area: text("area"),
  cuisine: text("cuisine"),
  menuUrl: text("menu_url"),
  imageUrl: text("image_url"),
  scrapedAt: timestamp("scraped_at").defaultNow(),
});

// ── Park Hours ─────────────────────────────────────────────
export const parkHours = pgTable(
  "park_hours",
  {
    id: serial("id").primaryKey(),
    parkId: text("park_id").references(() => parks.id),
    date: date("date").notNull(),
    openTime: time("open_time"),
    closeTime: time("close_time"),
    earlyEntry: time("early_entry"),
    eventName: text("event_name"),
    eventStart: time("event_start"),
    eventEnd: time("event_end"),
    scrapedAt: timestamp("scraped_at").defaultNow(),
  },
  (t) => [unique().on(t.parkId, t.date)]
);

// ── Events ─────────────────────────────────────────────────
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  startDate: date("start_date"),
  endDate: date("end_date"),
  description: text("description"),
  scrapedAt: timestamp("scraped_at").defaultNow(),
});

// ── Event Prices ───────────────────────────────────────────
export const eventPrices = pgTable(
  "event_prices",
  {
    id: serial("id").primaryKey(),
    eventId: integer("event_id").references(() => events.id),
    date: date("date").notNull(),
    ticketType: text("ticket_type"),
    price: decimal("price", { precision: 8, scale: 2 }),
    scrapedAt: timestamp("scraped_at").defaultNow(),
  },
  (t) => [unique().on(t.eventId, t.date, t.ticketType)]
);

// ── Hotels ─────────────────────────────────────────────────
export const hotels = pgTable("hotels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  tier: text("tier"), // 'premier', 'preferred', 'prime-value', 'value'
  perks: jsonb("perks"),
  imageUrl: text("image_url"),
  scrapedAt: timestamp("scraped_at").defaultNow(),
});

// ── Hotel Prices ───────────────────────────────────────────
export const hotelPrices = pgTable(
  "hotel_prices",
  {
    id: serial("id").primaryKey(),
    hotelId: integer("hotel_id").references(() => hotels.id),
    date: date("date").notNull(),
    roomType: text("room_type").notNull(),
    price: decimal("price", { precision: 8, scale: 2 }),
    scrapedAt: timestamp("scraped_at").defaultNow(),
  },
  (t) => [unique().on(t.hotelId, t.date, t.roomType)]
);

// ── Scrape Runs (monitoring) ───────────────────────────────
export const scrapeRuns = pgTable("scrape_runs", {
  id: serial("id").primaryKey(),
  scraper: text("scraper").notNull(),
  status: text("status").notNull(), // 'success', 'partial', 'failed'
  rowsUpserted: integer("rows_upserted").default(0),
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at").notNull(),
  finishedAt: timestamp("finished_at"),
});
