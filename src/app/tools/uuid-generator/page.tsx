"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function generateUUID(): string {
  return crypto.randomUUID();
}

export default function UuidGeneratorPage() {
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState(1);
  const [copied, setCopied] = useState(false);
  const [uppercase, setUppercase] = useState(false);
  const [noDashes, setNoDashes] = useState(false);

  const generate = useCallback(() => {
    const newUuids = Array.from({ length: count }, () => {
      let uuid = generateUUID();
      if (uppercase) uuid = uuid.toUpperCase();
      if (noDashes) uuid = uuid.replace(/-/g, "");
      return uuid;
    });
    setUuids(newUuids);
  }, [count, uppercase, noDashes]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        generate();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [generate]);

  const copyAll = useCallback(async () => {
    if (uuids.length === 0) return;
    await navigator.clipboard.writeText(uuids.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [uuids]);

  const copySingle = async (uuid: string) => {
    await navigator.clipboard.writeText(uuid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">UUID Generator</h1>
        <p className="text-muted-foreground mt-1">
          Generate random UUID v4 identifiers. Supports bulk generation, uppercase,
          and no-dash formats. 100% client-side.
        </p>
        <Badge variant="secondary" className="mt-2">
          No data sent to server
        </Badge>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Count:</label>
              <select
                className="bg-muted border border-border rounded-md px-3 py-1.5 text-sm"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
              >
                {[1, 5, 10, 25, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => setUppercase(e.target.checked)}
                className="rounded"
              />
              Uppercase
            </label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={noDashes}
                onChange={(e) => setNoDashes(e.target.checked)}
                className="rounded"
              />
              No Dashes
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button size="lg" onClick={generate}>
          Generate UUID{count > 1 ? "s" : ""}
        </Button>
        <span className="text-xs text-muted-foreground ml-2">Ctrl+Enter</span>
        <Button
          size="lg"
          variant="secondary"
          onClick={copyAll}
          disabled={uuids.length === 0}
        >
          {copied ? "Copied!" : "Copy All"}
        </Button>
      </div>

      {uuids.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">
                Generated UUID{uuids.length > 1 ? "s" : ""} ({uuids.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {uuids.length <= 10 ? (
              <div className="space-y-2">
                {uuids.map((uuid, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between font-mono text-sm bg-muted px-3 py-2 rounded-md"
                  >
                    <span>{uuid}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copySingle(uuid)}
                    >
                      Copy
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <Textarea
                className="font-mono text-sm min-h-[300px] resize-none"
                value={uuids.join("\n")}
                readOnly
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Related Tools */}
      <section className="py-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Hash Generator", href: "/tools/hash-generator" },
            { name: "Timestamp Converter", href: "/tools/timestamp-converter" },
            { name: "Base64 Encoder", href: "/tools/base64-encoder" },
            { name: "Cron Generator", href: "/tools/cron-generator" },
          ].map((tool) => (
            <a key={tool.href} href={tool.href} className="text-xs px-3 py-1.5 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors">
              {tool.name}
            </a>
          ))}
        </div>
      </section>

      <section className="space-y-4 py-8 border-t">
        <Tabs defaultValue="what">
          <TabsList>
            <TabsTrigger value="what">What is UUID?</TabsTrigger>
            <TabsTrigger value="how">How to Use</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent
            value="what"
            className="mt-4 space-y-3 text-muted-foreground text-sm"
          >
            <h2 className="text-lg font-semibold text-foreground">
              What is a UUID?
            </h2>
            <p>
              A UUID (Universally Unique Identifier) is a 128-bit identifier
              that is guaranteed to be unique across space and time. UUID v4,
              the most commonly used version, is generated using random or
              pseudo-random numbers. The format follows the pattern
              xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx where x is a random
              hexadecimal digit and y is one of 8, 9, a, or b.
            </p>
            <h3 className="text-base font-semibold text-foreground">
              Common Use Cases
            </h3>
            <p>
              UUIDs are widely used as database primary keys, session
              identifiers, API request tracking IDs, file naming conventions,
              and distributed system identifiers. They eliminate the need for a
              central authority to assign unique IDs, making them ideal for
              microservices and distributed architectures.
            </p>
          </TabsContent>

          <TabsContent
            value="how"
            className="mt-4 space-y-3 text-muted-foreground text-sm"
          >
            <h2 className="text-lg font-semibold text-foreground">
              How to Use
            </h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Select how many UUIDs you need (1 to 100).</li>
              <li>Choose format options (uppercase, no dashes).</li>
              <li>Click Generate to create UUIDs.</li>
              <li>Click Copy on individual UUIDs or Copy All for bulk copy.</li>
            </ol>
          </TabsContent>

          <TabsContent
            value="faq"
            className="mt-4 space-y-4 text-muted-foreground text-sm"
          >
            <h2 className="text-lg font-semibold text-foreground">FAQ</h2>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Are these UUIDs truly unique?
              </h3>
              <p>
                Yes. UUID v4 uses cryptographically secure random numbers via
                the Web Crypto API. The probability of generating a duplicate
                is astronomically low — about 1 in 5.3 × 10^36.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                What is the difference between UUID and GUID?
              </h3>
              <p>
                They are the same thing. UUID is the standard term, while GUID
                (Globally Unique Identifier) is the term used by Microsoft.
                Both refer to a 128-bit unique identifier.
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
