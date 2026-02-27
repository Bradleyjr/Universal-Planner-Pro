import type { Metadata } from "next";
import Client from "./client";

export const metadata: Metadata = {
  title: "Hotels",
  description:
    "Compare Universal Orlando on-site hotels by tier. See perks like Express Unlimited, early admission, and water taxi access.",
};

export default function Page() {
  return <Client />;
}
