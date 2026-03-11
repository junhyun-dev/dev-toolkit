import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Regex Tester - Free Online Regular Expression Tool",
  description:
    "Test and debug regular expressions with real-time highlighting, match groups, and common presets. 100% client-side processing — your data never leaves your browser.",
  keywords: [
    "regex tester",
    "regular expression tester",
    "regex online",
    "regex debugger",
    "regex match",
    "regex pattern tester",
    "regex validator",
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
