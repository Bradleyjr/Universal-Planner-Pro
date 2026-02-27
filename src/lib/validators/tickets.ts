import { z } from "zod/v4";

export const scrapedTicketPrice = z.object({
  date: z.iso.date(),
  parkCombo: z.enum(["1-park", "2-park", "3-park"]),
  tier: z.string().optional(),
  adultPrice: z.number().positive(),
  childPrice: z.number().positive(),
});

export const scrapedExpressPrice = z.object({
  date: z.iso.date(),
  passType: z.enum(["express", "express-unlimited"]),
  parkId: z.enum(["usf", "ioa", "epic"]),
  price: z.number().positive(),
});

export type ScrapedTicketPrice = z.infer<typeof scrapedTicketPrice>;
export type ScrapedExpressPrice = z.infer<typeof scrapedExpressPrice>;
