import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unix Timestamp Converter - Free Online Tool",
  description:
    "Convert Unix timestamps to human-readable dates and vice versa. Supports seconds, milliseconds, ISO 8601, and relative time. 100% client-side processing.",
  keywords: [
    "unix timestamp converter",
    "epoch converter",
    "timestamp to date",
    "date to timestamp",
    "unix time",
    "epoch time converter",
    "timestamp converter online",
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
