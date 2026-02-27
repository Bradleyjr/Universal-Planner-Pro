import type { Metadata } from "next";
import Client from "./client";

export const metadata: Metadata = {
  title: "Dining",
  description:
    "Find restaurants, quick service, and food carts across Universal Orlando parks. Search by cuisine, dining type, and location.",
};

export default function Page() {
  return <Client />;
}
