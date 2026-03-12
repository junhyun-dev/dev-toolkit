"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PRESETS: { label: string; cron: string }[] = [
  { label: "Every minute", cron: "* * * * *" },
  { label: "Every 5 minutes", cron: "*/5 * * * *" },
  { label: "Every 15 minutes", cron: "*/15 * * * *" },
  { label: "Every hour", cron: "0 * * * *" },
  { label: "Every day at midnight", cron: "0 0 * * *" },
  { label: "Every day at noon", cron: "0 12 * * *" },
  { label: "Every Monday at 9am", cron: "0 9 * * 1" },
  { label: "Every weekday at 6pm", cron: "0 18 * * 1-5" },
  { label: "Every Sunday at 3am", cron: "0 3 * * 0" },
  { label: "1st of every month", cron: "0 0 1 * *" },
  { label: "Every 6 hours", cron: "0 */6 * * *" },
];

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function describeCron(expression: string): string {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return "Invalid cron expression (expected 5 fields)";

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  const pieces: string[] = [];

  // Minute
  if (minute === "*") {
    pieces.push("Every minute");
  } else if (minute.startsWith("*/")) {
    pieces.push(`Every ${minute.slice(2)} minutes`);
  } else if (minute.includes(",")) {
    pieces.push(`At minutes ${minute}`);
  } else if (minute.includes("-")) {
    pieces.push(`Every minute from ${minute.replace("-", " through ")}`);
  } else {
    pieces.push(`At minute ${minute}`);
  }

  // Hour
  if (hour === "*") {
    if (minute !== "*" && !minute.startsWith("*/")) {
      pieces.push("of every hour");
    }
  } else if (hour.startsWith("*/")) {
    pieces.length = 0;
    pieces.push(`Every ${hour.slice(2)} hours`);
    if (minute !== "0" && minute !== "*") pieces.push(`at minute ${minute}`);
  } else if (hour.includes(",")) {
    pieces.push(`during hours ${hour}`);
  } else if (hour.includes("-")) {
    pieces.push(`during hours ${hour.replace("-", " through ")}`);
  } else {
    const h = parseInt(hour);
    const m = parseInt(minute) || 0;
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    const mStr = m.toString().padStart(2, "0");
    pieces.length = 0;
    pieces.push(`At ${h12}:${mStr} ${ampm}`);
  }

  // Day of month
  if (dayOfMonth !== "*") {
    if (dayOfMonth.startsWith("*/")) {
      pieces.push(`every ${dayOfMonth.slice(2)} days`);
    } else if (dayOfMonth.includes(",")) {
      pieces.push(`on days ${dayOfMonth} of the month`);
    } else {
      pieces.push(`on day ${dayOfMonth} of the month`);
    }
  }

  // Month
  if (month !== "*") {
    if (month.includes(",")) {
      const monthNames = month.split(",").map((m) => {
        const n = parseInt(m);
        return n >= 1 && n <= 12 ? MONTHS[n - 1] : m;
      });
      pieces.push(`in ${monthNames.join(", ")}`);
    } else if (month.includes("-")) {
      const [start, end] = month.split("-").map(Number);
      pieces.push(`from ${MONTHS[start - 1] || start} through ${MONTHS[end - 1] || end}`);
    } else {
      const n = parseInt(month);
      if (n >= 1 && n <= 12) pieces.push(`in ${MONTHS[n - 1]}`);
    }
  }

  // Day of week
  if (dayOfWeek !== "*") {
    if (dayOfWeek.includes(",")) {
      const dayNames = dayOfWeek.split(",").map((d) => {
        const n = parseInt(d);
        return n >= 0 && n <= 6 ? WEEKDAYS[n] : d;
      });
      pieces.push(`on ${dayNames.join(", ")}`);
    } else if (dayOfWeek.includes("-")) {
      const [start, end] = dayOfWeek.split("-").map(Number);
      pieces.push(`${WEEKDAYS[start] || start} through ${WEEKDAYS[end] || end}`);
    } else {
      const n = parseInt(dayOfWeek);
      if (n >= 0 && n <= 6) pieces.push(`on ${WEEKDAYS[n]}`);
    }
  }

  return pieces.join(", ").replace(/^./, (c) => c.toUpperCase());
}

function matchesCronField(field: string, value: number, max: number): boolean {
  if (field === "*") return true;

  // Step: */n
  if (field.startsWith("*/")) {
    const step = parseInt(field.slice(2));
    return step > 0 && value % step === 0;
  }

  // Range: a-b
  if (field.includes("-") && !field.includes(",")) {
    const [start, end] = field.split("-").map(Number);
    if (start <= end) return value >= start && value <= end;
    // Wrap around (e.g., 5-1 for days of week)
    return value >= start || value <= end;
  }

  // List: a,b,c
  if (field.includes(",")) {
    return field.split(",").some((part) => matchesCronField(part.trim(), value, max));
  }

  // Exact value
  return parseInt(field) === value;
}

function getNextExecutions(expression: string, count: number): Date[] {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return [];

  const [minField, hourField, domField, monField, dowField] = parts;
  const results: Date[] = [];
  const now = new Date();
  const candidate = new Date(now.getTime() + 60000); // start from next minute
  candidate.setSeconds(0, 0);

  const maxIter = 525600; // 1 year of minutes
  for (let i = 0; i < maxIter && results.length < count; i++) {
    const min = candidate.getMinutes();
    const hour = candidate.getHours();
    const dom = candidate.getDate();
    const mon = candidate.getMonth() + 1;
    const dow = candidate.getDay();

    if (
      matchesCronField(minField, min, 59) &&
      matchesCronField(hourField, hour, 23) &&
      matchesCronField(domField, dom, 31) &&
      matchesCronField(monField, mon, 12) &&
      matchesCronField(dowField, dow, 6)
    ) {
      results.push(new Date(candidate));
    }

    candidate.setMinutes(candidate.getMinutes() + 1);
  }

  return results;
}

function formatDate(d: Date): string {
  return d.toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function CronGeneratorPage() {
  const [expression, setExpression] = useState("* * * * *");
  const [description, setDescription] = useState("");
  const [nextRuns, setNextRuns] = useState<Date[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Builder fields
  const [minute, setMinute] = useState("*");
  const [hour, setHour] = useState("*");
  const [dayOfMonth, setDayOfMonth] = useState("*");
  const [month, setMonth] = useState("*");
  const [dayOfWeek, setDayOfWeek] = useState("*");

  const updateFromBuilder = useCallback(() => {
    const expr = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
    setExpression(expr);
  }, [minute, hour, dayOfMonth, month, dayOfWeek]);

  useEffect(() => {
    updateFromBuilder();
  }, [updateFromBuilder]);

  const parseExpression = useCallback(() => {
    const parts = expression.trim().split(/\s+/);
    if (parts.length !== 5) {
      setError("Cron expression must have exactly 5 fields: minute hour day month weekday");
      setDescription("");
      setNextRuns([]);
      return;
    }

    // Validate each field
    const validField = /^(\*|(\*\/\d+)|(\d+(-\d+)?(,\d+(-\d+)?)*))$/;
    for (let i = 0; i < 5; i++) {
      if (!validField.test(parts[i])) {
        setError(`Invalid field ${i + 1}: "${parts[i]}"`);
        setDescription("");
        setNextRuns([]);
        return;
      }
    }

    setError(null);
    setDescription(describeCron(expression));
    setNextRuns(getNextExecutions(expression, 5));

    // Sync builder
    setMinute(parts[0]);
    setHour(parts[1]);
    setDayOfMonth(parts[2]);
    setMonth(parts[3]);
    setDayOfWeek(parts[4]);
  }, [expression]);

  useEffect(() => {
    parseExpression();
  }, [parseExpression]);

  const copyToClipboard = useCallback(async () => {
    await navigator.clipboard.writeText(expression);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [expression]);

  const selectOpt = "w-full p-2 rounded-md border border-border bg-background text-sm font-mono";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cron Expression Generator</h1>
        <p className="text-muted-foreground mt-1">
          Build cron expressions visually or parse them into human-readable
          descriptions. See next execution times. 100% client-side.
        </p>
        <Badge variant="secondary" className="mt-2">
          No data sent to server
        </Badge>
      </div>

      {/* Presets */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Common Presets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <Button
                key={preset.cron}
                variant={expression === preset.cron ? "default" : "secondary"}
                size="sm"
                onClick={() => setExpression(preset.cron)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Builder */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Visual Builder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-5 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Minute
                </label>
                <select
                  className={selectOpt}
                  value={minute}
                  onChange={(e) => setMinute(e.target.value)}
                >
                  <option value="*">Every (*)</option>
                  <option value="*/5">Every 5 (*/5)</option>
                  <option value="*/10">Every 10 (*/10)</option>
                  <option value="*/15">Every 15 (*/15)</option>
                  <option value="*/30">Every 30 (*/30)</option>
                  <option value="0">0</option>
                  <option value="15">15</option>
                  <option value="30">30</option>
                  <option value="45">45</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Hour
                </label>
                <select
                  className={selectOpt}
                  value={hour}
                  onChange={(e) => setHour(e.target.value)}
                >
                  <option value="*">Every (*)</option>
                  <option value="*/2">Every 2 (*/2)</option>
                  <option value="*/6">Every 6 (*/6)</option>
                  <option value="*/12">Every 12 (*/12)</option>
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={String(i)}>
                      {i.toString().padStart(2, "0")}:00
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Day
                </label>
                <select
                  className={selectOpt}
                  value={dayOfMonth}
                  onChange={(e) => setDayOfMonth(e.target.value)}
                >
                  <option value="*">Every (*)</option>
                  {Array.from({ length: 31 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1)}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Month
                </label>
                <select
                  className={selectOpt}
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                >
                  <option value="*">Every (*)</option>
                  {MONTHS.map((m, i) => (
                    <option key={i + 1} value={String(i + 1)}>
                      {m.slice(0, 3)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Weekday
                </label>
                <select
                  className={selectOpt}
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                >
                  <option value="*">Every (*)</option>
                  <option value="1-5">Weekdays (1-5)</option>
                  <option value="0,6">Weekends (0,6)</option>
                  {WEEKDAYS.map((d, i) => (
                    <option key={i} value={String(i)}>
                      {d.slice(0, 3)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Direct expression input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">
                Or type directly:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 p-2 rounded-md border border-border bg-background font-mono text-sm"
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                  placeholder="* * * * *"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="shrink-0"
                >
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Output */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error ? (
              <div className="font-mono text-sm p-3 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
                Error: {error}
              </div>
            ) : (
              <>
                {/* Expression display */}
                <div className="p-3 rounded-md bg-muted/50">
                  <div className="text-xs font-semibold text-muted-foreground mb-1">
                    Cron Expression
                  </div>
                  <div className="font-mono text-lg font-bold">{expression}</div>
                </div>

                {/* Description */}
                <div className="p-3 rounded-md bg-muted/50">
                  <div className="text-xs font-semibold text-muted-foreground mb-1">
                    Human-Readable
                  </div>
                  <div className="text-sm font-medium">{description}</div>
                </div>

                {/* Next executions */}
                <div className="p-3 rounded-md bg-muted/50">
                  <div className="text-xs font-semibold text-muted-foreground mb-2">
                    Next 5 Executions
                  </div>
                  {nextRuns.length > 0 ? (
                    <ol className="space-y-1 text-sm font-mono">
                      {nextRuns.map((d, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="text-muted-foreground w-4">
                            {i + 1}.
                          </span>
                          {formatDate(d)}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No executions found within the next year.
                    </p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Related Tools */}
      <section className="py-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Timestamp Converter", href: "/tools/timestamp-converter" },
            { name: "Regex Tester", href: "/tools/regex-tester" },
            { name: "UUID Generator", href: "/tools/uuid-generator" },
            { name: "SQL Formatter", href: "/tools/sql-formatter" },
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
            <TabsTrigger value="what">What is Cron?</TabsTrigger>
            <TabsTrigger value="how">How to Use</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent
            value="what"
            className="mt-4 space-y-3 text-muted-foreground text-sm"
          >
            <h2 className="text-lg font-semibold text-foreground">
              What is a Cron Expression?
            </h2>
            <p>
              A cron expression is a string of five fields separated by spaces
              that defines a schedule for recurring tasks. It originates from the
              Unix cron job scheduler and is widely used in Linux servers, CI/CD
              pipelines, cloud functions, and task scheduling systems like
              GitHub Actions, AWS CloudWatch, and Kubernetes CronJobs.
            </p>
            <h3 className="text-base font-semibold text-foreground">
              Cron Syntax
            </h3>
            <p>
              The five fields are: minute (0-59), hour (0-23), day of month
              (1-31), month (1-12), and day of week (0-6, where 0 is Sunday).
              Special characters include * (every), */n (every n), comma for
              lists, and hyphen for ranges.
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
              <li>Use the visual builder dropdowns to set each field.</li>
              <li>Or click a preset for common schedules.</li>
              <li>
                Or type a cron expression directly in the text input.
              </li>
              <li>
                View the human-readable description and next 5 execution times.
              </li>
              <li>Copy the expression to use in your crontab or config.</li>
            </ol>
          </TabsContent>

          <TabsContent
            value="faq"
            className="mt-4 space-y-4 text-muted-foreground text-sm"
          >
            <h2 className="text-lg font-semibold text-foreground">FAQ</h2>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Does this support 6 or 7 field cron expressions?
              </h3>
              <p>
                This tool uses the standard 5-field Unix cron format. Some
                systems (like Quartz or Spring) use 6 or 7 fields that include
                seconds and/or year. Those extended formats are not currently
                supported.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                What timezone are the next execution times in?
              </h3>
              <p>
                The next execution times are calculated using your browser's
                local timezone. In production cron jobs, make sure to configure
                the correct timezone in your server or scheduler.
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
