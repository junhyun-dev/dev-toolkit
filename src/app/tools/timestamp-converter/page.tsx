"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const absDiff = Math.abs(diffMs);
  const isFuture = diffMs > 0;

  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  let text: string;
  if (seconds < 60) text = `${seconds} second${seconds !== 1 ? "s" : ""}`;
  else if (minutes < 60) text = `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  else if (hours < 24) text = `${hours} hour${hours !== 1 ? "s" : ""}`;
  else if (days < 30) text = `${days} day${days !== 1 ? "s" : ""}`;
  else if (months < 12) text = `${months} month${months !== 1 ? "s" : ""}`;
  else text = `${years} year${years !== 1 ? "s" : ""}`;

  return isFuture ? `in ${text}` : `${text} ago`;
}

export default function TimestampConverterPage() {
  const [timestampInput, setTimestampInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [timestampResult, setTimestampResult] = useState<string | null>(null);
  const [dateResult, setDateResult] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(0);
  const [copied, setCopied] = useState<string | null>(null);
  const [mode, setMode] = useState<"toDate" | "toTimestamp">("toDate");

  useEffect(() => {
    setCurrentTimestamp(Math.floor(Date.now() / 1000));
    const interval = setInterval(() => {
      setCurrentTimestamp(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const convertTimestampToDate = useCallback(() => {
    if (!timestampInput.trim()) {
      setDateResult(null);
      setError(null);
      return;
    }
    try {
      const num = Number(timestampInput.trim());
      if (isNaN(num)) throw new Error("Invalid timestamp. Enter a numeric value.");

      // Auto-detect seconds vs milliseconds
      const isMs = num > 1e12;
      const ms = isMs ? num : num * 1000;
      const date = new Date(ms);

      if (isNaN(date.getTime())) throw new Error("Invalid timestamp value.");

      setDateResult({
        "ISO 8601": date.toISOString(),
        "RFC 2822": date.toUTCString(),
        "Local String": date.toLocaleString(),
        "Date Only": date.toLocaleDateString(),
        "Time Only": date.toLocaleTimeString(),
        "Relative": formatRelativeTime(date),
        "Unix (seconds)": Math.floor(ms / 1000).toString(),
        "Unix (milliseconds)": ms.toString(),
      });
      setError(null);
    } catch (e) {
      setError((e as Error).message);
      setDateResult(null);
    }
  }, [timestampInput]);

  const convertDateToTimestamp = useCallback(() => {
    if (!dateInput.trim()) {
      setTimestampResult(null);
      setError(null);
      return;
    }
    try {
      const date = new Date(dateInput.trim());
      if (isNaN(date.getTime())) {
        throw new Error(
          "Invalid date format. Try ISO 8601 (2024-01-15T10:30:00Z) or a standard date string."
        );
      }

      const seconds = Math.floor(date.getTime() / 1000);
      const milliseconds = date.getTime();

      setTimestampResult(
        [
          `Unix (seconds):      ${seconds}`,
          `Unix (milliseconds): ${milliseconds}`,
          `ISO 8601:            ${date.toISOString()}`,
          `RFC 2822:            ${date.toUTCString()}`,
          `Local String:        ${date.toLocaleString()}`,
          `Relative:            ${formatRelativeTime(date)}`,
        ].join("\n")
      );
      setError(null);
    } catch (e) {
      setError((e as Error).message);
      setTimestampResult(null);
    }
  }, [dateInput]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (mode === "toDate") convertTimestampToDate();
        else convertDateToTimestamp();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mode, convertTimestampToDate, convertDateToTimestamp]);

  const copyToClipboard = useCallback(async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const loadSample = () => {
    if (mode === "toDate") {
      setTimestampInput("1700000000");
    } else {
      setDateInput("2024-07-04T12:00:00Z");
    }
    setError(null);
  };

  const clear = () => {
    setTimestampInput("");
    setDateInput("");
    setTimestampResult(null);
    setDateResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Unix Timestamp Converter</h1>
        <p className="text-muted-foreground mt-1">
          Convert between Unix timestamps and human-readable dates. 100%
          client-side processing.
        </p>
        <Badge variant="secondary" className="mt-2">
          No data sent to server
        </Badge>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Current Timestamp (Live)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <code className="text-2xl font-mono font-bold tabular-nums">
              {currentTimestamp}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(currentTimestamp.toString(), "current")}
            >
              {copied === "current" ? "Copied!" : "Copy"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTimestampInput(currentTimestamp.toString());
                setMode("toDate");
              }}
            >
              Use as Input
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(currentTimestamp * 1000).toISOString()}
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button
          size="lg"
          variant={mode === "toDate" ? "default" : "secondary"}
          onClick={() => setMode("toDate")}
        >
          Timestamp to Date
        </Button>
        <Button
          size="lg"
          variant={mode === "toTimestamp" ? "default" : "secondary"}
          onClick={() => setMode("toTimestamp")}
        >
          Date to Timestamp
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="lg" variant="secondary" onClick={loadSample}>
          Sample
        </Button>
        <Button size="lg" variant="secondary" onClick={clear}>
          Clear
        </Button>
      </div>

      {mode === "toDate" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Timestamp Input</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <input
                type="text"
                className="w-full font-mono text-sm px-3 py-2 rounded-md border border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Enter Unix timestamp (e.g. 1700000000)..."
                value={timestampInput}
                onChange={(e) => setTimestampInput(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Auto-detects seconds vs milliseconds
              </p>
              <div className="flex items-center gap-2">
                <Button onClick={convertTimestampToDate}>Convert</Button>
                <span className="text-xs text-muted-foreground">Ctrl+Enter</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Date Output</CardTitle>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="font-mono text-sm p-3 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
                  Error: {error}
                </div>
              ) : dateResult ? (
                <div className="space-y-2">
                  {Object.entries(dateResult).map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between p-2 rounded bg-muted/30 text-sm"
                    >
                      <div>
                        <span className="text-muted-foreground">{label}:</span>{" "}
                        <span className="font-mono">{value}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(value, label)}
                        className="shrink-0"
                      >
                        {copied === label ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground p-3">
                  Converted date will appear here...
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Date Input</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <input
                type="text"
                className="w-full font-mono text-sm px-3 py-2 rounded-md border border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Enter date (e.g. 2024-07-04T12:00:00Z)..."
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Supports ISO 8601, RFC 2822, or any format parseable by JavaScript Date
              </p>
              <div className="flex items-center gap-2">
                <Button onClick={convertDateToTimestamp}>Convert</Button>
                <span className="text-xs text-muted-foreground">Ctrl+Enter</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Timestamp Output</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    timestampResult &&
                    copyToClipboard(timestampResult, "result")
                  }
                  disabled={!timestampResult}
                >
                  {copied === "result" ? "Copied!" : "Copy"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="font-mono text-sm p-3 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
                  Error: {error}
                </div>
              ) : timestampResult ? (
                <Textarea
                  className="font-mono text-sm min-h-[200px] resize-none"
                  value={timestampResult}
                  readOnly
                />
              ) : (
                <div className="text-sm text-muted-foreground p-3">
                  Converted timestamp will appear here...
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Related Tools */}
      <section className="py-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Cron Generator", href: "/tools/cron-generator" },
            { name: "UUID Generator", href: "/tools/uuid-generator" },
            { name: "JSON Formatter", href: "/tools/json-formatter" },
            { name: "Hash Generator", href: "/tools/hash-generator" },
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
            <TabsTrigger value="what">What is Unix Timestamp?</TabsTrigger>
            <TabsTrigger value="how">How to Use</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent
            value="what"
            className="mt-4 space-y-3 text-muted-foreground text-sm"
          >
            <h2 className="text-lg font-semibold text-foreground">
              What is a Unix Timestamp?
            </h2>
            <p>
              A Unix timestamp (also known as Epoch time or POSIX time) is the
              number of seconds that have elapsed since January 1, 1970, 00:00:00
              UTC. It is a widely used standard for representing points in time in
              computing, databases, APIs, and log files.
            </p>
            <h3 className="text-base font-semibold text-foreground">
              Common Use Cases
            </h3>
            <p>
              Unix timestamps are used in database records, API responses, JWT tokens
              (exp and iat claims), log files, cron jobs, and anywhere a
              timezone-independent time representation is needed. They are especially
              useful for comparing dates and calculating durations.
            </p>
          </TabsContent>

          <TabsContent
            value="how"
            className="mt-4 space-y-3 text-muted-foreground text-sm"
          >
            <h2 className="text-lg font-semibold text-foreground">How to Use</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Choose &quot;Timestamp to Date&quot; or &quot;Date to Timestamp&quot; mode.</li>
              <li>Enter your value in the input field.</li>
              <li>Click Convert to see the result in multiple formats.</li>
              <li>Click Copy on any individual result to copy it to clipboard.</li>
              <li>The live timestamp at the top updates every second.</li>
            </ol>
          </TabsContent>

          <TabsContent
            value="faq"
            className="mt-4 space-y-4 text-muted-foreground text-sm"
          >
            <h2 className="text-lg font-semibold text-foreground">FAQ</h2>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                What is the difference between seconds and milliseconds?
              </h3>
              <p>
                Unix timestamps in seconds have 10 digits (e.g., 1700000000), while
                milliseconds have 13 digits (e.g., 1700000000000). This tool
                auto-detects which format you are using.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                What is the Year 2038 problem?
              </h3>
              <p>
                32-bit systems store Unix timestamps as a signed 32-bit integer,
                which will overflow on January 19, 2038. Most modern systems use
                64-bit integers, which extends the range billions of years into the
                future.
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
