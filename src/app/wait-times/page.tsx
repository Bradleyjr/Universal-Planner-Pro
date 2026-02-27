import type { Metadata } from "next";
import Client from "./client";

export const metadata: Metadata = {
  title: "Wait Times",
  description:
    "Live ride wait times for Islands of Adventure and Universal Studios Florida. Auto-refreshes every 5 minutes.",
};

export default function Page() {
  return <Client />;
}
