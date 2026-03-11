import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tailwind CSS Converter - Inline CSS to Tailwind & Back",
  description:
    "Convert inline CSS to Tailwind CSS classes or Tailwind classes to CSS. 100% client-side processing — your data never leaves your browser.",
  keywords: [
    "tailwind converter",
    "css to tailwind",
    "tailwind to css",
    "tailwind css converter",
    "inline css to tailwind",
    "tailwind class generator",
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
