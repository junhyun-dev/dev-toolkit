import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JWT Decoder - Decode JSON Web Tokens Securely",
  description:
    "Decode and inspect JWT tokens securely. 100% client-side — your tokens never leave your browser. Safe for production tokens.",
  keywords: [
    "jwt decoder",
    "jwt debugger",
    "decode jwt",
    "json web token decoder",
    "jwt parser",
    "jwt inspector",
    "jwt online",
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
