import type { Metadata } from "next";
import Client from "./client";

export const metadata: Metadata = {
  title: "Attractions",
  description:
    "Browse rides, shows, and experiences at Islands of Adventure, Universal Studios Florida, and Epic Universe. Filter by park and type.",
};

export default function Page() {
  return <Client />;
}
