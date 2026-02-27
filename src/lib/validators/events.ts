import { z } from "zod/v4";

export const scrapedEvent = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  startDate: z.string().optional(), // YYYY-MM-DD
  endDate: z.string().optional(),
  description: z.string().optional(),
});

export type ScrapedEvent = z.infer<typeof scrapedEvent>;
