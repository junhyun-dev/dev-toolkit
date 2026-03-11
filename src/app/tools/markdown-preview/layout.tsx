import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Markdown Preview - Free Online Markdown Editor",
  description:
    "Write and preview Markdown in real-time with a split editor view. Supports headers, bold, italic, links, code blocks, tables, and more. 100% client-side processing.",
  keywords: [
    "markdown preview",
    "markdown editor",
    "markdown to html",
    "markdown viewer",
    "online markdown editor",
    "markdown renderer",
    "markdown live preview",
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
