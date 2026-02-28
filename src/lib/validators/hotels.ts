import { z } from "zod/v4";

export const scrapedHotel = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  tier: z.enum(["premier", "preferred", "prime-value", "value"]).optional(),
  perks: z.array(z.string()).optional(),
  imageUrl: z.string().url().optional(),
});

export type ScrapedHotel = z.infer<typeof scrapedHotel>;
