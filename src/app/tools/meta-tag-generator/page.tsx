"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MetaFields {
  title: string;
  description: string;
  keywords: string;
  author: string;
  robots: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  ogType: string;
  ogSiteName: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  twitterSite: string;
}

const DEFAULT_FIELDS: MetaFields = {
  title: "",
  description: "",
  keywords: "",
  author: "",
  robots: "index, follow",
  canonical: "",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  ogUrl: "",
  ogType: "website",
  ogSiteName: "",
  twitterCard: "summary_large_image",
  twitterTitle: "",
  twitterDescription: "",
  twitterImage: "",
  twitterSite: "",
};

function generateMetaTags(f: MetaFields): string {
  const lines: string[] = [];

  lines.push("<!-- Basic Meta Tags -->");
  if (f.title) lines.push(`<title>${esc(f.title)}</title>`);
  if (f.description) lines.push(`<meta name="description" content="${esc(f.description)}">`);
  if (f.keywords) lines.push(`<meta name="keywords" content="${esc(f.keywords)}">`);
  if (f.author) lines.push(`<meta name="author" content="${esc(f.author)}">`);
  if (f.robots) lines.push(`<meta name="robots" content="${esc(f.robots)}">`);
  if (f.canonical) lines.push(`<link rel="canonical" href="${esc(f.canonical)}">`);

  const ogTitle = f.ogTitle || f.title;
  const ogDesc = f.ogDescription || f.description;
  if (ogTitle || ogDesc || f.ogImage || f.ogUrl) {
    lines.push("", "<!-- Open Graph / Facebook -->");
    lines.push(`<meta property="og:type" content="${esc(f.ogType)}">`);
    if (ogTitle) lines.push(`<meta property="og:title" content="${esc(ogTitle)}">`);
    if (ogDesc) lines.push(`<meta property="og:description" content="${esc(ogDesc)}">`);
    if (f.ogImage) lines.push(`<meta property="og:image" content="${esc(f.ogImage)}">`);
    if (f.ogUrl) lines.push(`<meta property="og:url" content="${esc(f.ogUrl)}">`);
    if (f.ogSiteName) lines.push(`<meta property="og:site_name" content="${esc(f.ogSiteName)}">`);
  }

  const twTitle = f.twitterTitle || f.title;
  const twDesc = f.twitterDescription || f.description;
  const twImage = f.twitterImage || f.ogImage;
  if (twTitle || twDesc || twImage) {
    lines.push("", "<!-- Twitter Card -->");
    lines.push(`<meta name="twitter:card" content="${esc(f.twitterCard)}">`);
    if (twTitle) lines.push(`<meta name="twitter:title" content="${esc(twTitle)}">`);
    if (twDesc) lines.push(`<meta name="twitter:description" content="${esc(twDesc)}">`);
    if (twImage) lines.push(`<meta name="twitter:image" content="${esc(twImage)}">`);
    if (f.twitterSite) lines.push(`<meta name="twitter:site" content="${esc(f.twitterSite)}">`);
  }

  return lines.join("\n");
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function Field({
  label,
  hint,
  value,
  onChange,
  placeholder,
  type = "text",
  maxLength,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  maxLength?: number;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between">
        <label className="text-xs font-medium">{label}</label>
        {maxLength && (
          <span className={`text-xs ${value.length > maxLength ? "text-red-400" : "text-muted-foreground"}`}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-sm bg-muted px-3 py-2 rounded-md border border-border focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}

export default function MetaTagGeneratorPage() {
  const [fields, setFields] = useState<MetaFields>(DEFAULT_FIELDS);
  const [copied, setCopied] = useState(false);

  const set = (key: keyof MetaFields) => (v: string) =>
    setFields((prev) => ({ ...prev, [key]: v }));

  const generated = generateMetaTags(fields);

  const copyAll = async () => {
    await navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => setFields(DEFAULT_FIELDS);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Meta Tag Generator</h1>
        <p className="text-muted-foreground mt-1">
          Generate HTML meta tags, Open Graph tags, and Twitter Card tags. Real-time output.
        </p>
        <Badge variant="secondary" className="mt-2">
          Real-time Generation
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input Fields */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Basic SEO</CardTitle>
                <Button variant="ghost" size="sm" onClick={reset}>Reset</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Field label="Page Title" value={fields.title} onChange={set("title")} placeholder="My Awesome Page" maxLength={60} />
              <Field label="Description" value={fields.description} onChange={set("description")} placeholder="A short description of this page..." maxLength={160} />
              <Field label="Keywords" value={fields.keywords} onChange={set("keywords")} placeholder="keyword1, keyword2, keyword3" hint="Comma-separated" />
              <Field label="Author" value={fields.author} onChange={set("author")} placeholder="John Doe" />
              <div className="space-y-1">
                <label className="text-xs font-medium">Robots</label>
                <select
                  value={fields.robots}
                  onChange={(e) => set("robots")(e.target.value)}
                  className="w-full text-sm bg-muted px-3 py-2 rounded-md border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="index, follow">index, follow</option>
                  <option value="noindex, follow">noindex, follow</option>
                  <option value="index, nofollow">index, nofollow</option>
                  <option value="noindex, nofollow">noindex, nofollow</option>
                </select>
              </div>
              <Field label="Canonical URL" value={fields.canonical} onChange={set("canonical")} placeholder="https://example.com/page" type="url" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Open Graph (Facebook / LinkedIn)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Field label="OG Title" value={fields.ogTitle} onChange={set("ogTitle")} placeholder="Leave blank to use Page Title" />
              <Field label="OG Description" value={fields.ogDescription} onChange={set("ogDescription")} placeholder="Leave blank to use Description" />
              <Field label="OG Image URL" value={fields.ogImage} onChange={set("ogImage")} placeholder="https://example.com/image.jpg" type="url" />
              <Field label="OG URL" value={fields.ogUrl} onChange={set("ogUrl")} placeholder="https://example.com/page" type="url" />
              <Field label="Site Name" value={fields.ogSiteName} onChange={set("ogSiteName")} placeholder="My Site" />
              <div className="space-y-1">
                <label className="text-xs font-medium">OG Type</label>
                <select
                  value={fields.ogType}
                  onChange={(e) => set("ogType")(e.target.value)}
                  className="w-full text-sm bg-muted px-3 py-2 rounded-md border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="website">website</option>
                  <option value="article">article</option>
                  <option value="product">product</option>
                  <option value="profile">profile</option>
                  <option value="video.movie">video.movie</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Twitter Card</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Card Type</label>
                <select
                  value={fields.twitterCard}
                  onChange={(e) => set("twitterCard")(e.target.value)}
                  className="w-full text-sm bg-muted px-3 py-2 rounded-md border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="summary_large_image">summary_large_image</option>
                  <option value="summary">summary</option>
                  <option value="app">app</option>
                  <option value="player">player</option>
                </select>
              </div>
              <Field label="Twitter Title" value={fields.twitterTitle} onChange={set("twitterTitle")} placeholder="Leave blank to use Page Title" />
              <Field label="Twitter Description" value={fields.twitterDescription} onChange={set("twitterDescription")} placeholder="Leave blank to use Description" />
              <Field label="Twitter Image URL" value={fields.twitterImage} onChange={set("twitterImage")} placeholder="Leave blank to use OG Image" type="url" />
              <Field label="Twitter Site Handle" value={fields.twitterSite} onChange={set("twitterSite")} placeholder="@username" />
            </CardContent>
          </Card>
        </div>

        {/* Generated Output */}
        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Generated HTML</CardTitle>
                <Button variant="ghost" size="sm" onClick={copyAll}>
                  {copied ? "Copied!" : "Copy All"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="font-mono text-xs bg-muted px-3 py-3 rounded-md overflow-auto max-h-[600px] whitespace-pre-wrap break-all">
                {generated || "<!-- Fill in the fields to generate meta tags -->"}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Related Tools */}
      <section className="py-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Open Graph Preview", href: "/tools/og-preview" },
            { name: "JSON Formatter", href: "/tools/json-formatter" },
            { name: "URL Encoder", href: "/tools/url-encoder" },
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
            <TabsTrigger value="what">What are Meta Tags?</TabsTrigger>
            <TabsTrigger value="how">How to Use</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="what" className="mt-4 space-y-3 text-muted-foreground text-sm">
            <h2 className="text-lg font-semibold text-foreground">What are Meta Tags?</h2>
            <p>
              Meta tags are HTML elements placed in the <code className="font-mono text-xs bg-muted px-1 rounded">&lt;head&gt;</code> section
              that provide metadata about a web page. Search engines use the title and description
              for search result snippets. Open Graph tags control how a page appears when shared
              on Facebook or LinkedIn. Twitter Card tags control the Twitter share preview.
            </p>
            <h3 className="text-base font-semibold text-foreground">Why OG Image matters</h3>
            <p>
              A compelling Open Graph image dramatically increases click-through rates when content
              is shared on social media. The recommended size is 1200×630 pixels (1.91:1 ratio).
            </p>
          </TabsContent>

          <TabsContent value="how" className="mt-4 space-y-3 text-muted-foreground text-sm">
            <h2 className="text-lg font-semibold text-foreground">How to Use</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Fill in the Basic SEO fields (title and description are the most important).</li>
              <li>Add OG Image URL for better social sharing previews.</li>
              <li>The generated HTML updates in real time on the right.</li>
              <li>Click &quot;Copy All&quot; and paste into your HTML &lt;head&gt; section.</li>
            </ol>
          </TabsContent>

          <TabsContent value="faq" className="mt-4 space-y-4 text-muted-foreground text-sm">
            <h2 className="text-lg font-semibold text-foreground">FAQ</h2>
            <div>
              <h3 className="text-sm font-semibold text-foreground">What is the ideal description length?</h3>
              <p>
                Google typically displays 155–160 characters of the meta description in search results.
                The counter turns red if you exceed 160 characters.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Do keywords still matter for SEO?</h3>
              <p>
                Google no longer uses the keywords meta tag for ranking. It&apos;s ignored by most major
                search engines. However, it may still be used by some smaller search engines or
                internal site search tools.
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
