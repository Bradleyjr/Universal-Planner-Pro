import { z } from "zod/v4";

export const scrapedAttraction = z.object({
  parkId: z.enum(["usf", "ioa", "epic"]),
  name: z.string().min(1),
  slug: z.string().min(1),
  type: z.enum(["ride", "show", "experience"]).optional(),
  area: z.string().optional(),
  heightReqIn: z.number().int().positive().optional(),
  expressEligible: z.boolean().optional(),
  accessibility: z.record(z.string(), z.unknown()).optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
});

export type ScrapedAttraction = z.infer<typeof scrapedAttraction>;
