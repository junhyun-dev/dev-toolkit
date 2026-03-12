"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OGData {
  title: string;
  description: string;
  imageUrl: string;
  url: string;
  siteName: string;
}

const SAMPLE: OGData = {
  title: "DevToolkit — Free Developer Tools Online",
  description:
    "100+ free developer tools: JSON formatter, diff checker, JWT decoder, hash generator and more. No login required, 100% client-side.",
  imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=630&fit=crop",
  url: "https://www.devtoolkit.cc",
  siteName: "DevToolkit",
};

function truncate(str: string, len: number) {
  return str.length > len ? str.slice(0, len) + "…" : str;
}

function FacebookCard({ data }: { data: OGData }) {
  const domain = data.url ? data.url.replace(/https?:\/\/(www\.)?/, "").split("/")[0].toUpperCase() : "EXAMPLE.COM";
  return (
    <div className="rounded-sm overflow-hidden border border-[#3a3b3c] bg-[#242526] w-full max-w-[500px]">
      {data.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={data.imageUrl}
          alt="OG Preview"
          className="w-full aspect-[1.91/1] object-cover bg-muted"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div className="w-full aspect-[1.91/1] bg-muted flex items-center justify-center text-muted-foreground text-sm">
          No image
        </div>
      )}
      <div className="px-3 py-2 bg-[#3a3b3c]">
        <div className="text-xs text-[#b0b3b8] uppercase tracking-wide mb-0.5">{domain}</div>
        <div className="text-sm font-semibold text-[#e4e6eb] leading-tight">
          {truncate(data.title || "Page Title", 88)}
        </div>
        {data.description && (
          <div className="text-xs text-[#b0b3b8] mt-0.5 leading-snug">
            {truncate(data.description, 110)}
          </div>
        )}
      </div>
    </div>
  );
}

function TwitterCard({ data }: { data: OGData }) {
  const domain = data.url ? data.url.replace(/https?:\/\/(www\.)?/, "").split("/")[0] : "example.com";
  return (
    <div className="rounded-2xl overflow-hidden border border-[#2f3336] bg-black w-full max-w-[500px]">
      {data.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={data.imageUrl}
          alt="Twitter Card Preview"
          className="w-full aspect-[1.91/1] object-cover bg-muted"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div className="w-full aspect-[1.91/1] bg-muted flex items-center justify-center text-muted-foreground text-sm">
          No image
        </div>
      )}
      <div className="px-3 py-2 border-t border-[#2f3336]">
        <div className="text-sm font-bold text-white leading-tight">
          {truncate(data.title || "Page Title", 70)}
        </div>
        {data.description && (
          <div className="text-sm text-[#71767b] mt-0.5 leading-snug">
            {truncate(data.description, 100)}
          </div>
        )}
        <div className="text-sm text-[#71767b] mt-0.5 flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
          {domain}
        </div>
      </div>
    </div>
  );
}

function LinkedInCard({ data }: { data: OGData }) {
  const domain = data.url ? data.url.replace(/https?:\/\/(www\.)?/, "").split("/")[0] : "example.com";
  return (
    <div className="rounded overflow-hidden border border-[#e0e0e0] bg-white w-full max-w-[500px] shadow-sm">
      {data.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={data.imageUrl}
          alt="LinkedIn Preview"
          className="w-full aspect-[1.91/1] object-cover bg-muted"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div className="w-full aspect-[1.91/1] bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
          No image
        </div>
      )}
      <div className="px-3 py-2 bg-[#f3f2ef]">
        <div className="text-sm font-semibold text-[#000000e6] leading-tight">
          {truncate(data.title || "Page Title", 88)}
        </div>
        <div className="text-xs text-[#00000099] mt-0.5">
          {data.siteName ? `${data.siteName} • ` : ""}{domain}
        </div>
      </div>
    </div>
  );
}

export default function OgPreviewPage() {
  const [data, setData] = useState<OGData>({
    title: "",
    description: "",
    imageUrl: "",
    url: "",
    siteName: "",
  });
  const [platform, setPlatform] = useState<"facebook" | "twitter" | "linkedin">("facebook");

  const set = (key: keyof OGData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setData((prev) => ({ ...prev, [key]: e.target.value }));

  const loadSample = () => setData(SAMPLE);
  const reset = () => setData({ title: "", description: "", imageUrl: "", url: "", siteName: "" });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Open Graph Preview</h1>
        <p className="text-muted-foreground mt-1">
          Preview how your page looks when shared on Facebook, Twitter, and LinkedIn.
        </p>
        <Badge variant="secondary" className="mt-2">
          Real-time Preview
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Page Info</CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={loadSample}>Sample</Button>
                <Button variant="ghost" size="sm" onClick={reset}>Clear</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium">Title</label>
              <input
                type="text"
                value={data.title}
                onChange={set("title")}
                placeholder="Page title"
                maxLength={100}
                className="w-full text-sm bg-muted px-3 py-2 rounded-md border border-border focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="text-xs text-muted-foreground text-right">{data.title.length}/100</div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">Description</label>
              <textarea
                value={data.description}
                onChange={set("description")}
                placeholder="A short description of the page"
                maxLength={200}
                rows={3}
                className="w-full text-sm bg-muted px-3 py-2 rounded-md border border-border focus:outline-none focus:ring-1 focus:ring-primary resize-none font-sans"
              />
              <div className="text-xs text-muted-foreground text-right">{data.description.length}/200</div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">Image URL</label>
              <input
                type="url"
                value={data.imageUrl}
                onChange={set("imageUrl")}
                placeholder="https://example.com/image.jpg (1200×630 recommended)"
                className="w-full text-sm bg-muted px-3 py-2 rounded-md border border-border focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground">Recommended: 1200×630px, under 8MB</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">Page URL</label>
              <input
                type="url"
                value={data.url}
                onChange={set("url")}
                placeholder="https://example.com/page"
                className="w-full text-sm bg-muted px-3 py-2 rounded-md border border-border focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">Site Name</label>
              <input
                type="text"
                value={data.siteName}
                onChange={set("siteName")}
                placeholder="My Website"
                className="w-full text-sm bg-muted px-3 py-2 rounded-md border border-border focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Preview</CardTitle>
                <div className="flex gap-1">
                  {(["facebook", "twitter", "linkedin"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPlatform(p)}
                      className={`text-xs px-3 py-1.5 rounded-md capitalize transition-colors ${
                        platform === p
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80 text-muted-foreground"
                      }`}
                    >
                      {p === "facebook" ? "Facebook" : p === "twitter" ? "X / Twitter" : "LinkedIn"}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center p-4 bg-muted/50 rounded-md">
                {platform === "facebook" && <FacebookCard data={data} />}
                {platform === "twitter" && <TwitterCard data={data} />}
                {platform === "linkedin" && <LinkedInCard data={data} />}
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: "Title set", ok: data.title.length > 0 },
                { label: "Title ≤ 60 chars", ok: data.title.length > 0 && data.title.length <= 60 },
                { label: "Description set", ok: data.description.length > 0 },
                { label: "Description ≤ 160 chars", ok: data.description.length > 0 && data.description.length <= 160 },
                { label: "Image URL set", ok: data.imageUrl.length > 0 },
                { label: "Page URL set", ok: data.url.length > 0 },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-xs">
                  <span className={item.ok ? "text-green-400" : "text-muted-foreground"}>
                    {item.ok ? "✓" : "○"}
                  </span>
                  <span className={item.ok ? "text-foreground" : "text-muted-foreground"}>
                    {item.label}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Related Tools */}
      <section className="py-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Meta Tag Generator", href: "/tools/meta-tag-generator" },
            { name: "URL Encoder", href: "/tools/url-encoder" },
            { name: "JSON Formatter", href: "/tools/json-formatter" },
            { name: "CSS Gradient Generator", href: "/tools/css-gradient-generator" },
          ].map((tool) => (
            <a
              key={tool.href}
              href={tool.href}
              className="text-xs px-3 py-1.5 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
            >
              {tool.name}
            </a>
          ))}
        </div>
      </section>

      <section className="space-y-4 py-8 border-t">
        <Tabs defaultValue="what">
          <TabsList>
            <TabsTrigger value="what">What is Open Graph?</TabsTrigger>
            <TabsTrigger value="how">How to Use</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="what" className="mt-4 space-y-3 text-muted-foreground text-sm">
            <h2 className="text-lg font-semibold text-foreground">What is Open Graph?</h2>
            <p>
              Open Graph (OG) is a protocol created by Facebook that lets websites control how their
              content appears when shared on social media. By adding a few meta tags to your HTML
              &lt;head&gt;, you determine the title, description, and image that shows up in link previews
              on Facebook, LinkedIn, Slack, Discord, and many other platforms.
            </p>
            <h3 className="text-base font-semibold text-foreground">Twitter Cards</h3>
            <p>
              Twitter has its own similar system called Twitter Cards (now X Cards). If Twitter-specific
              tags are absent, platforms often fall back to the OG tags. Using
              <code className="font-mono text-xs bg-muted px-1 rounded"> summary_large_image </code>
              is the most common card type for articles and landing pages.
            </p>
          </TabsContent>

          <TabsContent value="how" className="mt-4 space-y-3 text-muted-foreground text-sm">
            <h2 className="text-lg font-semibold text-foreground">How to Use</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Fill in the title, description, image URL, and page URL fields.</li>
              <li>Switch between Facebook, Twitter, and LinkedIn tabs to see the card previews.</li>
              <li>Check the Checklist to make sure all key fields are filled correctly.</li>
              <li>Use the Meta Tag Generator tool to generate the actual HTML tags to paste into your page.</li>
            </ol>
          </TabsContent>

          <TabsContent value="faq" className="mt-4 space-y-4 text-muted-foreground text-sm">
            <h2 className="text-lg font-semibold text-foreground">FAQ</h2>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Why isn&apos;t my updated image showing?</h3>
              <p>
                Social platforms aggressively cache OG data. Facebook provides a Sharing Debugger tool
                to force a re-fetch. Twitter also has a Card Validator. It may take a few minutes for
                changes to propagate.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">What image size should I use?</h3>
              <p>
                1200×630 pixels at 1.91:1 aspect ratio is the universal recommendation. Keep the file
                size under 8MB. JPG or PNG both work fine.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Support */}
      <div className="mt-8 text-center py-6 border rounded-lg bg-card">
        <p className="text-muted-foreground text-sm">
          Enjoying this tool?{" "}
          <a href="https://buymeacoffee.com/devtoolkit" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            ☕ Buy me a coffee
          </a>
          {" "} to support free tools!
        </p>
      </div>
    </div>
  );
}
