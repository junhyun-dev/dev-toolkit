import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Color Converter - HEX, RGB, HSL, OKLCH - Free Online Tool",
  description:
    "Convert colors between HEX, RGB, HSL, and OKLCH formats with live preview. 100% client-side processing — your data never leaves your browser.",
  keywords: [
    "color converter",
    "hex to rgb",
    "rgb to hex",
    "hsl to hex",
    "oklch converter",
    "color picker online",
    "color format converter",
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
