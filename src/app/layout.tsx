import type { Metadata } from "next";
import localFont from "next/font/local";
import { Nav } from "@/components/nav";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "Universal Planner Pro — Universal Orlando Trip Planner",
    template: "%s | Universal Planner Pro",
  },
  description:
    "Track Universal Orlando ticket prices, park hours, wait times, attractions, dining, and hotel deals — all in one place. Free trip planning for Islands of Adventure, Universal Studios Florida, and Epic Universe.",
  keywords: [
    "Universal Orlando",
    "ticket prices",
    "park hours",
    "wait times",
    "Islands of Adventure",
    "Universal Studios Florida",
    "Epic Universe",
    "trip planner",
  ],
  openGraph: {
    title: "Universal Planner Pro",
    description:
      "Track Universal Orlando ticket prices, wait times, and plan your trip.",
    type: "website",
    locale: "en_US",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Nav />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
