export interface TicketProduct {
  id: string;
  name: string;
  description: string;
  baseAdultPrice: number;
  baseChildPrice: number;
  expressEligible: boolean;
  park: 'Universal Studios Florida' | 'Islands of Adventure' | 'Volcano Bay' | 'Park-to-Park';
}

export interface TicketQuote extends TicketProduct {
  days: number;
  adults: number;
  children: number;
  subtotal: number;
  taxesAndFees: number;
  total: number;
}

export interface ExpressPass {
  id: string;
  name: string;
  description: string;
  price: number;
  park: 'Universal Studios Florida' | 'Islands of Adventure' | 'Two-Park';
  tier: 'Standard' | 'Unlimited';
}

export interface Hotel {
  id: string;
  name: string;
  description: string;
  nightlyRate: number;
  rating: number;
  distanceToParkMiles: number;
  onsite: boolean;
  perks: string[];
  thumbnail: string;
}

export interface HotelQuote extends Hotel {
  nights: number;
  guests: number;
  taxesAndFees: number;
  total: number;
}

export interface ParkHour {
  id: string;
  park: 'Universal Studios Florida' | 'Islands of Adventure' | 'Volcano Bay';
  date: string;
  opens: string;
  closes: string;
  earlyParkAdmission: boolean;
  specialEvent?: string;
}

export interface DiningLocation {
  id: string;
  name: string;
  park: 'Universal Studios Florida' | 'Islands of Adventure' | 'CityWalk' | 'Volcano Bay';
  cuisine: string;
  priceLevel: '$' | '$$' | '$$$';
  mealTypes: ('breakfast' | 'lunch' | 'dinner' | 'snack')[];
  reservationRecommended: boolean;
  url: string;
  description: string;
}

export interface EventListing {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  price: number;
  category: 'Holiday' | 'Concert' | 'Seasonal' | 'Food & Beverage';
}

export interface DashboardSummary {
  ticketCount: number;
  hotelCount: number;
  expressOptions: number;
  diningCount: number;
  eventCount: number;
}

export interface CrowdCalendarEntry {
  id: string;
  park: string;
  date: string;
  crowdLevel: number;
  rationale: string[];
}
