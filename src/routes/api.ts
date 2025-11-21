import { Router } from 'express';
import {
  diningLocations,
  eventListings,
  expressPasses,
  hotels,
  parkHours,
  ticketProducts,
} from '../data/mockData';
import { DashboardSummary, DiningLocation, EventListing, HotelQuote, TicketQuote } from '../types';

const router = Router();

const parseInteger = (value: unknown, fallback: number): number => {
  if (typeof value !== 'string') return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const applyTicketMath = (
  days: number,
  adults: number,
  children: number,
  product: typeof ticketProducts[number],
): TicketQuote => {
  const weekendUpsell = 1.08;
  const includesWeekend = days >= 3;
  const subtotal =
    (product.baseAdultPrice * adults + product.baseChildPrice * children) * days *
    (includesWeekend ? weekendUpsell : 1);
  const taxesAndFees = subtotal * 0.065;
  return {
    ...product,
    days,
    adults,
    children,
    subtotal: Number(subtotal.toFixed(2)),
    taxesAndFees: Number(taxesAndFees.toFixed(2)),
    total: Number((subtotal + taxesAndFees).toFixed(2)),
  };
};

const buildHotelQuote = (
  nights: number,
  guests: number,
  hotel: typeof hotels[number],
): HotelQuote => {
  const housekeeping = nights * 5;
  const resortFee = hotel.onsite ? 35 * nights : 18 * nights;
  const taxesAndFees = Number(((hotel.nightlyRate * nights + housekeeping + resortFee) * 0.125).toFixed(2));
  const base = hotel.nightlyRate * nights + housekeeping + resortFee;
  return {
    ...hotel,
    nights,
    guests,
    taxesAndFees,
    total: Number((base + taxesAndFees).toFixed(2)),
  };
};

router.get('/summary', (_req, res) => {
  const summary: DashboardSummary = {
    ticketCount: ticketProducts.length,
    hotelCount: hotels.length,
    expressOptions: expressPasses.length,
    diningCount: diningLocations.length,
    eventCount: eventListings.length,
  };

  res.json({ summary });
});

router.get('/tickets', (req, res) => {
  const days = Math.max(1, parseInteger(req.query.days, 1));
  const adults = Math.max(1, parseInteger(req.query.adults, 2));
  const children = Math.max(0, parseInteger(req.query.children, 0));

  const filtered = ticketProducts
    .filter((product) => !req.query.park || product.park === req.query.park)
    .map((product) => applyTicketMath(days, adults, children, product));

  res.json({ tickets: filtered });
});

router.get('/hotels', (req, res) => {
  const nights = Math.max(1, parseInteger(req.query.nights, 2));
  const guests = Math.max(1, parseInteger(req.query.guests, 2));
  const onsite = req.query.onsite ? req.query.onsite === 'true' : undefined;
  const minRating = req.query.minRating ? Number(req.query.minRating) : undefined;

  let filtered = hotels;
  if (onsite !== undefined) {
    filtered = filtered.filter((hotel) => hotel.onsite === onsite);
  }
  if (minRating) {
    filtered = filtered.filter((hotel) => hotel.rating >= minRating);
  }

  const quotes: HotelQuote[] = filtered.map((hotel) => buildHotelQuote(nights, guests, hotel));

  res.json({ hotels: quotes });
});

router.get('/express', (_req, res) => {
  res.json({ expressPasses });
});

router.get('/park-hours', (req, res) => {
  const dateFilter = typeof req.query.date === 'string' ? req.query.date : undefined;
  const parkFilter = typeof req.query.park === 'string' ? req.query.park : undefined;

  const hours = parkHours.filter((row) => {
    const matchesDate = dateFilter ? row.date === dateFilter : true;
    const matchesPark = parkFilter ? row.park === parkFilter : true;
    return matchesDate && matchesPark;
  });

  res.json({ parkHours: hours });
});

router.get('/dining', (req, res) => {
  const cuisineFilter = typeof req.query.cuisine === 'string' ? req.query.cuisine.toLowerCase() : undefined;
  const mealFilter = typeof req.query.meal === 'string' ? req.query.meal.toLowerCase() : undefined;

  const dining: DiningLocation[] = diningLocations.filter((spot) => {
    const matchesCuisine = cuisineFilter ? spot.cuisine.toLowerCase().includes(cuisineFilter) : true;
    const matchesMeal = mealFilter ? spot.mealTypes.includes(mealFilter as typeof spot.mealTypes[number]) : true;
    return matchesCuisine && matchesMeal;
  });

  res.json({ dining });
});

router.get('/events', (req, res) => {
  const category = typeof req.query.category === 'string' ? req.query.category : undefined;
  const month = typeof req.query.month === 'string' ? req.query.month : undefined;

  const events: EventListing[] = eventListings.filter((event) => {
    const matchesCategory = category ? event.category === category : true;
    const matchesMonth = month ? event.date.startsWith(month) : true;
    return matchesCategory && matchesMonth;
  });

  res.json({ events });
});

export default router;
