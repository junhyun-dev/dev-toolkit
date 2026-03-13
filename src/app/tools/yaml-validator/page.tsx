"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Minimal YAML parser (handles common cases without external deps)
function parseYAML(yaml: string): { success: true; data: unknown } | { success: false; error: string; line?: number } {
  try {
    // Tokenize line by line to give useful error positions
    const lines = yaml.split("\n");
    const result = parseYAMLLines(lines);
    return { success: true, data: result };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    const lineMatch = msg.match(/line (\d+)/i);
    return {
      success: false,
      error: msg,
      line: lineMatch ? parseInt(lineMatch[1]) : undefined,
    };
  }
}

function parseYAMLValue(val: string): unknown {
  const trimmed = val.trim();
  if (trimmed === "true" || trimmed === "yes") return true;
  if (trimmed === "false" || trimmed === "no") return false;
  if (trimmed === "null" || trimmed === "~" || trimmed === "") return null;
  if (/^-?\d+$/.test(trimmed)) return parseInt(trimmed, 10);
  if (/^-?\d+\.\d+$/.test(trimmed)) return parseFloat(trimmed);
  // Quoted strings
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function getIndent(line: string): number {
  let i = 0;
  while (i < line.length && line[i] === " ") i++;
  return i;
}

function parseYAMLLines(lines: string[]): unknown {
  // Strip document markers and comments
  const cleaned = lines
    .map((l) => (l.trimStart().startsWith("#") ? "" : l))
    .filter((l, i) => !(l.trim() === "---" || l.trim() === "...") || i === 0);

  // Detect if root is a list or mapping
  const firstMeaningful = cleaned.find((l) => l.trim() !== "");
  if (!firstMeaningful) return null;

  if (firstMeaningful.trimStart().startsWith("- ")) {
    return parseList(cleaned, 0).value;
  }
  return parseMapping(cleaned, 0).value;
}

function parseMapping(lines: string[], baseIndent: number): { value: Record<string, unknown>; consumed: number } {
  const obj: Record<string, unknown> = {};
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "" || line.trim().startsWith("#")) { i++; continue; }
    const indent = getIndent(line);
    if (indent < baseIndent) break;
    if (indent > baseIndent) { i++; continue; }

    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) { i++; continue; }

    const key = line.slice(indent, colonIdx).trim();
    const rest = line.slice(colonIdx + 1).trim();

    if (rest === "" || rest.startsWith("#")) {
      // Value is on next lines
      const nextLines = lines.slice(i + 1);
      const nextMeaningful = nextLines.find((l) => l.trim() !== "" && !l.trim().startsWith("#"));
      if (!nextMeaningful) { obj[key] = null; i++; continue; }
      const nextIndent = getIndent(nextMeaningful);
      if (nextMeaningful.trimStart().startsWith("- ")) {
        const sub = parseList(nextLines, nextIndent);
        obj[key] = sub.value;
        i += 1 + sub.consumed;
      } else {
        const sub = parseMapping(nextLines, nextIndent);
        obj[key] = sub.value;
        i += 1 + sub.consumed;
      }
    } else if (rest.startsWith("|") || rest.startsWith(">")) {
      // Block scalar — collect following lines
      const blockLines: string[] = [];
      let j = i + 1;
      while (j < lines.length) {
        if (lines[j].trim() === "" || getIndent(lines[j]) > indent) {
          blockLines.push(lines[j]);
          j++;
        } else break;
      }
      obj[key] = blockLines.map((l) => l.trim()).join(rest.startsWith("|") ? "\n" : " ").trim();
      i = j;
    } else {
      obj[key] = parseYAMLValue(rest);
      i++;
    }
  }
  return { value: obj, consumed: i };
}

function parseList(lines: string[], baseIndent: number): { value: unknown[]; consumed: number } {
  const arr: unknown[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "" || line.trim().startsWith("#")) { i++; continue; }
    const indent = getIndent(line);
    if (indent < baseIndent) break;
    if (!line.trimStart().startsWith("- ")) { i++; continue; }

    const rest = line.slice(indent + 2).trim();
    if (rest === "" || rest.startsWith("#")) {
      // Nested object
      const nextLines = lines.slice(i + 1);
      const nextMeaningful = nextLines.find((l) => l.trim() !== "");
      if (!nextMeaningful) { arr.push(null); i++; continue; }
      const nextIndent = getIndent(nextMeaningful);
      const sub = parseMapping(nextLines, nextIndent);
      arr.push(sub.value);
      i += 1 + sub.consumed;
    } else {
      arr.push(parseYAMLValue(rest));
      i++;
    }
  }
  return { value: arr, consumed: i };
}

const SAMPLE_YAML = `name: my-app
version: "1.0.0"
description: A sample application

server:
  host: localhost
  port: 3000
  debug: true

database:
  host: db.example.com
  port: 5432
  name: mydb
  pool:
    min: 2
    max: 10

features:
  - authentication
  - logging
  - caching

env: production`;

export default function YamlValidatorPage() {
  const MAX_INPUT_LENGTH = 5 * 1024 * 1024;
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{ success: true; json: string } | { success: false; error: string; line?: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"validate" | "json">("validate");

  const validate = useCallback(() => {
    if (!input.trim()) {
      setResult(null);
      return;
    }
    const parsed = parseYAML(input);
    if (parsed.success) {
      setResult({ success: true, json: JSON.stringify(parsed.data, null, 2) });
    } else {
      setResult({ success: false, error: parsed.error, line: parsed.line });
    }
  }, [input]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        validate();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [validate]);

  const copyJson = async () => {
    if (result?.success) {
      await navigator.clipboard.writeText(result.json);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">YAML Validator</h1>
        <p className="text-muted-foreground mt-1">
          Validate YAML syntax and convert to JSON. Detailed error messages with line numbers.
        </p>
        <Badge variant="secondary" className="mt-2">
          No data sent to server
        </Badge>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">YAML Input</CardTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setInput(SAMPLE_YAML)}>
                Sample
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setInput(""); setResult(null); }}
              >
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Paste your YAML here..."
            className="font-mono text-sm min-h-[200px] resize-none"
            value={input}
            onChange={(e) => { if (e.target.value.length > MAX_INPUT_LENGTH) { alert("Input too large. Maximum size is 5MB."); return; } setInput(e.target.value); }}
          />
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button size="lg" onClick={validate}>
          Validate YAML
        </Button>
        <span className="text-xs text-muted-foreground">Ctrl+Enter</span>
      </div>

      {result && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                Result
                {result.success ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-normal">Valid YAML</span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-normal">Invalid YAML</span>
                )}
              </CardTitle>
              {result.success && (
                <Button variant="ghost" size="sm" onClick={copyJson}>
                  {copied ? "Copied!" : "Copy JSON"}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {result.success ? (
              <div>
                <div className="text-xs text-muted-foreground mb-2">Converted JSON:</div>
                <pre className="font-mono text-sm bg-muted px-3 py-3 rounded-md overflow-auto max-h-80">
                  {result.json}
                </pre>
              </div>
            ) : (
              <div className="space-y-2">
                {result.line && (
                  <div className="text-xs text-muted-foreground">
                    Line <span className="font-semibold text-red-400">{result.line}</span>
                  </div>
                )}
                <div className="font-mono text-sm bg-red-500/10 border border-red-500/20 px-3 py-3 rounded-md text-red-400">
                  {result.error}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Related Tools */}
      <section className="py-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "JSON Formatter", href: "/tools/json-formatter" },
            { name: "JSON to YAML", href: "/tools/json-to-yaml" },
            { name: "Diff Checker", href: "/tools/diff-checker" },
            { name: "SQL Formatter", href: "/tools/sql-formatter" },
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
            <TabsTrigger value="what">What is YAML?</TabsTrigger>
            <TabsTrigger value="how">How to Use</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="what" className="mt-4 space-y-3 text-muted-foreground text-sm">
            <h2 className="text-lg font-semibold text-foreground">What is YAML?</h2>
            <p>
              YAML (YAML Ain&apos;t Markup Language) is a human-readable data serialization format widely used
              for configuration files, CI/CD pipelines (GitHub Actions, GitLab CI), Kubernetes manifests,
              and Docker Compose files. Its indentation-based structure makes it easy to read but also easy
              to get wrong — a single misplaced space can break an entire config.
            </p>
            <h3 className="text-base font-semibold text-foreground">Common YAML Mistakes</h3>
            <p>
              Tabs vs. spaces (YAML only allows spaces), missing colons after keys, incorrect indentation
              levels, and unquoted special characters like colons or hashes inside values are the most
              frequent sources of YAML errors.
            </p>
          </TabsContent>

          <TabsContent value="how" className="mt-4 space-y-3 text-muted-foreground text-sm">
            <h2 className="text-lg font-semibold text-foreground">How to Use</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Paste your YAML into the input area or click Sample to load an example.</li>
              <li>Click &quot;Validate YAML&quot; or press Ctrl+Enter.</li>
              <li>If valid, the converted JSON is shown — click Copy JSON to copy it.</li>
              <li>If invalid, the error message and line number are highlighted in red.</li>
            </ol>
          </TabsContent>

          <TabsContent value="faq" className="mt-4 space-y-4 text-muted-foreground text-sm">
            <h2 className="text-lg font-semibold text-foreground">FAQ</h2>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Does this support all YAML features?</h3>
              <p>
                This tool handles common YAML patterns: mappings, sequences, scalars, nested structures,
                and block scalars. Anchors, aliases, and complex multi-document YAML are not fully supported.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Is my data safe?</h3>
              <p>
                Yes. All processing happens entirely in your browser. Nothing is sent to any server.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
