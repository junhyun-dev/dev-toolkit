import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON to YAML Converter - Free Online Tool",
  description:
    "Convert JSON to YAML and YAML to JSON instantly. No external libraries needed. 100% client-side processing — your data never leaves your browser.",
  keywords: [
    "json to yaml",
    "yaml to json",
    "json yaml converter",
    "json to yaml online",
    "yaml to json online",
    "yaml converter",
    "json converter",
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
