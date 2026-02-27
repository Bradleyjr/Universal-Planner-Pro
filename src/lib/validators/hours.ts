import { z } from "zod/v4";

const timeRegex = /^\d{2}:\d{2}$/;
const timeString = z.string().regex(timeRegex, "Expected HH:MM format");

export const scrapedParkHours = z.object({
  parkId: z.enum(["usf", "ioa", "epic"]),
  date: z.iso.date(),
  openTime: timeString.optional(),
  closeTime: timeString.optional(),
  earlyEntry: timeString.optional(),
  eventName: z.string().optional(),
  eventStart: timeString.optional(),
  eventEnd: timeString.optional(),
});

export type ScrapedParkHours = z.infer<typeof scrapedParkHours>;
