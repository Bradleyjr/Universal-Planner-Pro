import pino from "pino";

const logger = pino({ name: "scraper:wait-times" });

// Queue-Times.com — free, no auth required
const QUEUE_TIMES_PARKS = [
  { parkId: "ioa", queueTimesId: 64, name: "Islands of Adventure" },
  { parkId: "usf", queueTimesId: 65, name: "Universal Studios Florida" },
];

interface QueueTimesResponse {
  lands: Array<{
    name: string;
    rides: Array<{
      id: number;
      name: string;
      is_open: boolean;
      wait_time: number;
      last_updated: string;
    }>;
  }>;
}

export interface WaitTimeData {
  parkId: string;
  rideName: string;
  land: string;
  isOpen: boolean;
  waitMinutes: number;
  lastUpdated: string;
}

/**
 * Fetch current wait times from Queue-Times.com (free API, no auth).
 * This does NOT require Playwright or Firecrawl — it's a direct JSON API.
 *
 * Note: Epic Universe is not yet in Queue-Times.com. When it's added,
 * update the QUEUE_TIMES_PARKS array.
 *
 * Returns wait time data for all rides across IOA and USF.
 */
export async function fetchWaitTimes(): Promise<WaitTimeData[]> {
  const allWaitTimes: WaitTimeData[] = [];

  for (const park of QUEUE_TIMES_PARKS) {
    try {
      const url = `https://queue-times.com/parks/${park.queueTimesId}/queue_times.json`;
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        logger.warn(
          { park: park.name, status: res.status },
          "Queue-Times API request failed"
        );
        continue;
      }

      const data: QueueTimesResponse = await res.json();

      for (const land of data.lands) {
        for (const ride of land.rides) {
          allWaitTimes.push({
            parkId: park.parkId,
            rideName: ride.name,
            land: land.name,
            isOpen: ride.is_open,
            waitMinutes: ride.wait_time,
            lastUpdated: ride.last_updated,
          });
        }
      }

      logger.info(
        { park: park.name, rides: allWaitTimes.length },
        "Fetched wait times"
      );
    } catch (err) {
      logger.warn({ park: park.name, err }, "Failed to fetch wait times");
    }
  }

  return allWaitTimes;
}
