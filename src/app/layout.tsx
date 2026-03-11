import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "DevToolKit - Free Online Developer Tools",
    template: "%s | DevToolKit",
  },
  description:
    "Free online developer tools that run 100% in your browser. No data sent to servers. JSON Formatter, Diff Checker, JWT Decoder and more.",
  keywords: [
    "developer tools",
    "json formatter",
    "diff checker",
    "jwt decoder",
    "online tools",
    "free tools",
  ],
  verification: {
    google: "Cz2zRxPaak4rqPqji-v0dtj81RQCIfFcqwga4ZywETo",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "DevToolKit",
  },
};

const tools = [
  { name: "JSON Formatter", href: "/tools/json-formatter", emoji: "{}" },
  { name: "Diff Checker", href: "/tools/diff-checker", emoji: "<>" },
  { name: "JWT Decoder", href: "/tools/jwt-decoder", emoji: "🔑" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold tracking-tight">
              <span className="text-primary">Dev</span>
              <span className="text-muted-foreground">ToolKit</span>
            </Link>
            <nav className="hidden md:flex items-center gap-4 text-sm">
              {tools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {tool.name}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-card mt-auto">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <p>
                DevToolKit - 100% client-side. Your data never leaves your
                browser.
              </p>
              <div className="flex gap-4">
                <Link href="/about" className="hover:text-foreground">
                  About
                </Link>
                <Link href="/contact" className="hover:text-foreground">
                  Contact
                </Link>
                <Link href="/privacy-policy" className="hover:text-foreground">
                  Privacy
                </Link>
                <Link href="/terms" className="hover:text-foreground">
                  Terms
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
