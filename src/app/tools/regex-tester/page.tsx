"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MAX_INPUT_LENGTH = 5 * 1024 * 1024; // 5MB
const REGEX_TIMEOUT_MS = 2000;

interface MatchResult {
  fullMatch: string;
  groups: string[];
  index: number;
}

const PRESETS: Record<string, { pattern: string; flags: string; label: string }> = {
  email: { pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}", flags: "gi", label: "Email" },
  url: { pattern: "https?://[\\w\\-._~:/?#\\[\\]@!$&'()*+,;=%]+", flags: "gi", label: "URL" },
  ip: { pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b", flags: "g", label: "IP Address" },
  phone: { pattern: "\\+?[\\d\\s\\-().]{7,15}", flags: "g", label: "Phone Number" },
  date: { pattern: "\\d{4}[-/]\\d{1,2}[-/]\\d{1,2}", flags: "g", label: "Date (YYYY-MM-DD)" },
};

const SAMPLE_PATTERN = "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}";
const SAMPLE_TEST = `Contact us at support@example.com or sales@company.org.
Visit https://example.com for more info.
Invalid emails: @missing.com, user@, plaintext
Another valid one: dev.team+test@sub.domain.co.uk`;

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState("");
  const [testString, setTestString] = useState("");
  const [flagG, setFlagG] = useState(true);
  const [flagI, setFlagI] = useState(false);
  const [flagM, setFlagM] = useState(false);
  const [flagS, setFlagS] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const workerRef = useRef<Worker | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flags = useMemo(() => {
    let f = "";
    if (flagG) f += "g";
    if (flagI) f += "i";
    if (flagM) f += "m";
    if (flagS) f += "s";
    return f;
  }, [flagG, flagI, flagM, flagS]);

  // Run regex in Web Worker with timeout
  useEffect(() => {
    if (!pattern.trim() || !testString) {
      setError(null);
      setMatches([]);
      return;
    }

    // Validate regex syntax first (instant)
    try {
      new RegExp(pattern, flags);
    } catch (e) {
      setError((e as Error).message);
      setMatches([]);
      return;
    }

    // Kill previous worker
    if (workerRef.current) {
      workerRef.current.terminate();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const worker = new Worker(
      new URL("./regex-worker.ts", import.meta.url)
    );
    workerRef.current = worker;

    worker.onmessage = (e) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (e.data.type === "result") {
        setError(null);
        setMatches(e.data.results);
      } else {
        setError(e.data.message);
        setMatches([]);
      }
      worker.terminate();
    };

    // Timeout protection against ReDoS
    timeoutRef.current = setTimeout(() => {
      worker.terminate();
      setError("Regex execution timed out (possible ReDoS pattern). Try a simpler expression.");
      setMatches([]);
    }, REGEX_TIMEOUT_MS);

    worker.postMessage({ pattern, flags, testString });

    return () => {
      worker.terminate();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [pattern, testString, flags]);

  const highlightedHTML = useMemo(() => {
    if (!pattern.trim() || !testString || error || matches.length === 0) return null;
    try {
      const re = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
      let lastIndex = 0;
      const parts: string[] = [];
      let m;
      const tempRe = new RegExp(re.source, re.flags);
      while ((m = tempRe.exec(testString)) !== null) {
        if (m.index > lastIndex) {
          parts.push(escapeHtml(testString.slice(lastIndex, m.index)));
        }
        parts.push(
          `<mark class="bg-yellow-300 dark:bg-yellow-600 rounded px-0.5">${escapeHtml(m[0])}</mark>`
        );
        lastIndex = m.index + m[0].length;
        if (!m[0]) { tempRe.lastIndex++; lastIndex++; }
      }
      if (lastIndex < testString.length) {
        parts.push(escapeHtml(testString.slice(lastIndex)));
      }
      return parts.join("");
    } catch {
      return null;
    }
  }, [pattern, testString, flags, error, matches]);

  const copyMatches = useCallback(async () => {
    if (!matches.length) return;
    const text = matches.map((m) => m.fullMatch).join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [matches]);

  const loadPreset = (key: string) => {
    const preset = PRESETS[key];
    setPattern(preset.pattern);
    setFlagG(preset.flags.includes("g"));
    setFlagI(preset.flags.includes("i"));
    setFlagM(preset.flags.includes("m"));
    setFlagS(preset.flags.includes("s"));
  };

  const loadSample = () => {
    setPattern(SAMPLE_PATTERN);
    setTestString(SAMPLE_TEST);
    setFlagG(true);
    setFlagI(true);
    setFlagM(false);
    setFlagS(false);
  };

  const clear = () => {
    setPattern("");
    setTestString("");
    setError(null);
    setMatches([]);
  };

  const handleTestStringChange = (val: string) => {
    if (val.length > MAX_INPUT_LENGTH) {
      alert("Input too large. Maximum size is 5MB.");
      return;
    }
    setTestString(val);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Regex Tester</h1>
        <p className="text-muted-foreground mt-1">
          Test regular expressions with real-time highlighting and match groups.
          100% client-side processing.
        </p>
        <Badge variant="secondary" className="mt-2">
          No data sent to server
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="lg" variant="secondary" onClick={loadSample}>
          Sample
        </Button>
        <Button size="lg" variant="secondary" onClick={clear}>
          Clear
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Regex Pattern</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-mono text-lg">/</span>
            <input
              type="text"
              className="flex-1 font-mono text-sm px-3 py-2 rounded-md border border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Enter regex pattern..."
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
            />
            <span className="text-muted-foreground font-mono text-lg">/</span>
            <span className="font-mono text-sm text-muted-foreground">{flags}</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium">Flags:</span>
            {[
              { key: "g", label: "Global (g)", state: flagG, setter: setFlagG },
              { key: "i", label: "Case Insensitive (i)", state: flagI, setter: setFlagI },
              { key: "m", label: "Multiline (m)", state: flagM, setter: setFlagM },
              { key: "s", label: "Dotall (s)", state: flagS, setter: setFlagS },
            ].map((f) => (
              <label key={f.key} className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={f.state}
                  onChange={(e) => f.setter(e.target.checked)}
                  className="rounded"
                />
                {f.label}
              </label>
            ))}
          </div>
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-2" aria-live="polite">
              Error: {error}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Common Presets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(PRESETS).map(([key, preset]) => (
              <Button key={key} variant="outline" size="sm" onClick={() => loadPreset(key)}>
                {preset.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Test String</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter text to test against..."
              className="font-mono text-sm min-h-[300px] resize-none"
              value={testString}
              onChange={(e) => handleTestStringChange(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">
                Highlighted Matches{" "}
                {matches.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {matches.length} match{matches.length !== 1 ? "es" : ""}
                  </Badge>
                )}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={copyMatches} disabled={!matches.length}>
                {copied ? "Copied!" : "Copy Matches"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {highlightedHTML ? (
              <div
                className="font-mono text-sm min-h-[300px] p-3 rounded-md border bg-muted/30 whitespace-pre-wrap break-words"
                dangerouslySetInnerHTML={{ __html: highlightedHTML }}
              />
            ) : (
              <div className="font-mono text-sm min-h-[300px] p-3 rounded-md border bg-muted/30 text-muted-foreground">
                {testString
                  ? "Enter a valid regex pattern to see highlights..."
                  : "Matches will be highlighted here..."}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {matches.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Match Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {matches.map((m, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 text-sm font-mono p-2 rounded bg-muted/30"
                >
                  <span className="text-muted-foreground shrink-0">#{i + 1}</span>
                  <div>
                    <span className="text-foreground font-medium">{m.fullMatch}</span>
                    <span className="text-muted-foreground ml-2">(index: {m.index})</span>
                    {m.groups.length > 0 && (
                      <div className="text-muted-foreground mt-1">
                        Groups: {m.groups.map((g, gi) => (
                          <Badge key={gi} variant="outline" className="ml-1 font-mono text-xs">
                            ${gi + 1}: {g ?? "undefined"}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Related Tools */}
      <section className="py-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Diff Checker", href: "/tools/diff-checker" },
            { name: "SQL Formatter", href: "/tools/sql-formatter" },
            { name: "URL Encoder", href: "/tools/url-encoder" },
            { name: "JSON Formatter", href: "/tools/json-formatter" },
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
            <TabsTrigger value="what">What is Regex?</TabsTrigger>
            <TabsTrigger value="how">How to Use</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent
            value="what"
            className="mt-4 space-y-3 text-muted-foreground text-sm"
          >
            <h2 className="text-lg font-semibold text-foreground">
              What is a Regular Expression?
            </h2>
            <p>
              A regular expression (regex or regexp) is a sequence of characters that
              defines a search pattern. It is used for pattern matching within strings,
              enabling powerful text search, validation, and manipulation. Regex is
              supported in virtually every programming language including JavaScript,
              Python, Java, Go, and many more.
            </p>
            <h3 className="text-base font-semibold text-foreground">
              Common Use Cases
            </h3>
            <p>
              Developers use regex for validating user input (emails, phone numbers,
              URLs), searching and replacing text in code editors, parsing log files,
              extracting data from structured text, and building lexers or tokenizers
              for compilers and interpreters.
            </p>
          </TabsContent>

          <TabsContent
            value="how"
            className="mt-4 space-y-3 text-muted-foreground text-sm"
          >
            <h2 className="text-lg font-semibold text-foreground">How to Use</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Enter a regex pattern in the pattern field (without delimiters).</li>
              <li>Select flags using the checkboxes (global, case insensitive, etc.).</li>
              <li>Type or paste your test string in the input area.</li>
              <li>Matches are highlighted in real-time with details shown below.</li>
              <li>Use presets to quickly load common patterns like email or URL.</li>
            </ol>
          </TabsContent>

          <TabsContent
            value="faq"
            className="mt-4 space-y-4 text-muted-foreground text-sm"
          >
            <h2 className="text-lg font-semibold text-foreground">FAQ</h2>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Is my data stored or sent anywhere?
              </h3>
              <p>
                No. All regex processing happens entirely in your browser. No data is
                sent to any server.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Which regex flavor does this use?
              </h3>
              <p>
                This tool uses JavaScript&apos;s built-in RegExp engine, which supports
                ECMAScript regex syntax including lookaheads, lookbehinds, named groups,
                and Unicode properties.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                What do the flags mean?
              </h3>
              <p>
                <strong>g</strong> (global) finds all matches, <strong>i</strong> ignores
                case, <strong>m</strong> makes ^ and $ match line boundaries, and{" "}
                <strong>s</strong> makes . match newline characters.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
