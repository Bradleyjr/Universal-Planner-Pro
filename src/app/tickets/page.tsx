import type { Metadata } from "next";
import Client from "./client";

export const metadata: Metadata = {
  title: "Ticket Prices",
  description:
    "Compare daily ticket prices for Universal Orlando 1-park, 2-park, and 3-park tickets. Find the cheapest days to visit.",
};

export default function Page() {
  return <Client />;
}
