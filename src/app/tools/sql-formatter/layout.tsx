import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SQL Formatter & Beautifier - Free Online Tool",
  description:
    "Format, beautify, and minify SQL queries with proper indentation. Supports SELECT, INSERT, UPDATE, DELETE, CREATE, and more. 100% client-side.",
  keywords: [
    "sql formatter",
    "sql beautifier",
    "sql pretty print",
    "format sql online",
    "sql minifier",
    "sql query formatter",
    "sql indent",
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
