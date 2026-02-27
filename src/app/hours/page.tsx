import type { Metadata } from "next";
import Client from "./client";

export const metadata: Metadata = {
  title: "Park Hours",
  description:
    "View Universal Orlando park hours, early park admission times, and special event schedules in a monthly calendar view.",
};

export default function Page() {
  return <Client />;
}
