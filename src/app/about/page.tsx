import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "About",
  description:
    "DevToolKit provides free, privacy-first developer tools that run entirely in your browser.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">About DevToolKit</h1>
        <p className="text-muted-foreground mt-2">
          Free, fast, and private developer tools.
        </p>
      </div>

      <section className="space-y-4 text-sm text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground">Our Mission</h2>
        <p>
          DevToolKit was built with one simple goal: provide developers with
          essential tools that are fast, free, and respect their privacy. Every
          tool on this site runs 100% in your browser — no data is ever sent to
          our servers.
        </p>
        <p>
          We believe that developer tools should be accessible to everyone,
          without requiring sign-ups, subscriptions, or sacrificing your data
          privacy.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">100% Client-Side</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            All processing happens in your browser. Your data never touches our
            servers.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Free Forever</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Core tools will always be free. No hidden paywalls, no forced
            sign-ups.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Open & Transparent</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            You can verify our privacy claims by checking the Network tab in
            your browser&apos;s dev tools.
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4 text-sm text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground">
          Available Tools
        </h2>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">JSON Formatter & Validator</Badge>
          <Badge variant="secondary">Diff Checker</Badge>
          <Badge variant="secondary">JWT Decoder</Badge>
          <Badge variant="outline">More coming soon</Badge>
        </div>
      </section>

      <section className="space-y-4 text-sm text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground">Disclosure</h2>
        <p>
          This site participates in affiliate programs, including the Amazon
          Services LLC Associates Program. This means we may earn a small
          commission when you purchase products through our links, at no extra
          cost to you. These commissions help us keep the tools free.
        </p>
        <p>
          As an Amazon Associate, I earn from qualifying purchases.
        </p>
      </section>
    </div>
  );
}
