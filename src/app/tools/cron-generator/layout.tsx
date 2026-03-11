import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cron Expression Generator & Parser - Free Online Tool",
  description:
    "Build and parse cron expressions visually. See human-readable descriptions and next execution times. 100% client-side processing.",
  keywords: [
    "cron generator",
    "cron expression builder",
    "cron parser",
    "crontab generator",
    "cron schedule",
    "cron expression explained",
    "cron next run",
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
