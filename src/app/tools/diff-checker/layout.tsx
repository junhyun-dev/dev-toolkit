import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diff Checker - Compare Text & Code Online",
  description:
    "Compare two texts or code blocks side by side and see the differences highlighted. 100% client-side, free, no sign-up required.",
  keywords: [
    "diff checker",
    "text compare",
    "code compare",
    "text diff",
    "compare two texts",
    "online diff tool",
    "code diff",
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
