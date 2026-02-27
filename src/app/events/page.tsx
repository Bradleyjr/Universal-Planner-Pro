import type { Metadata } from "next";
import Client from "./client";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Stay up to date on Universal Orlando events including Halloween Horror Nights, Mardi Gras, Holidays, and Rock the Universe.",
};

export default function Page() {
  return <Client />;
}
