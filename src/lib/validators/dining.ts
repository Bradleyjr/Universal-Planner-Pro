import { z } from "zod/v4";

export const scrapedDining = z.object({
  parkId: z.enum(["usf", "ioa", "epic"]),
  name: z.string().min(1),
  slug: z.string().min(1),
  type: z.enum(["quick-service", "table-service", "cart"]).optional(),
  area: z.string().optional(),
  cuisine: z.string().optional(),
  menuUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
});

export type ScrapedDining = z.infer<typeof scrapedDining>;
