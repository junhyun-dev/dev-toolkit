"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- Built-in JSON <-> YAML converters (no external libraries) ---

function jsonToYaml(value: unknown, indent: number = 0): string {
  const pad = "  ".repeat(indent);

  if (value === null || value === undefined) return "null";
  if (typeof value === "boolean") return value.toString();
  if (typeof value === "number") return value.toString();
  if (typeof value === "string") {
    // Quote strings that could be misinterpreted
    if (
      value === "" ||
      value === "true" ||
      value === "false" ||
      value === "null" ||
      value === "yes" ||
      value === "no" ||
      /^[\d]/.test(value) ||
      /[:#{}[\],&*?|>!%@`]/.test(value) ||
      value.includes("\n")
    ) {
      return JSON.stringify(value);
    }
    return value;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const lines = value.map((item) => {
      const converted = jsonToYaml(item, indent + 1);
      if (typeof item === "object" && item !== null && !Array.isArray(item)) {
        const objLines = converted.split("\n");
        return `${pad}- ${objLines[0]}\n${objLines.slice(1).map((l) => `${pad}  ${l}`).join("\n")}`;
      }
      return `${pad}- ${converted}`;
    });
    return lines.join("\n");
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return "{}";
    const lines = entries.map(([key, val]) => {
      const safeKey = /[:#{}[\],&*?|>!%@`\s]/.test(key) ? JSON.stringify(key) : key;
      if (typeof val === "object" && val !== null) {
        const nested = jsonToYaml(val, indent + 1);
        return `${pad}${safeKey}:\n${nested}`;
      }
      return `${pad}${safeKey}: ${jsonToYaml(val, indent + 1)}`;
    });
    return lines.join("\n");
  }

  return String(value);
}

function yamlToJson(yaml: string): unknown {
  const lines = yaml.split("\n");
  const result = parseYamlLines(lines, 0, 0);
  return result.value;
}

interface ParseResult {
  value: unknown;
  nextLine: number;
}

function getIndent(line: string): number {
  const match = line.match(/^(\s*)/);
  return match ? match[1].length : 0;
}

function parseYamlValue(raw: string): unknown {
  const trimmed = raw.trim();
  if (trimmed === "" || trimmed === "null" || trimmed === "~") return null;
  if (trimmed === "true" || trimmed === "yes") return true;
  if (trimmed === "false" || trimmed === "no") return false;
  if (trimmed === "[]") return [];
  if (trimmed === "{}") return {};

  // Quoted string
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed.slice(1, -1);
    }
  }

  // Number
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    const num = Number(trimmed);
    if (!isNaN(num)) return num;
  }

  // Inline JSON array or object
  if (
    (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
    (trimmed.startsWith("{") && trimmed.endsWith("}"))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed;
    }
  }

  return trimmed;
}

function parseYamlLines(
  lines: string[],
  startLine: number,
  baseIndent: number
): ParseResult {
  if (startLine >= lines.length) return { value: null, nextLine: startLine };

  // Skip empty lines and comments
  let i = startLine;
  while (i < lines.length && (lines[i].trim() === "" || lines[i].trim().startsWith("#"))) {
    i++;
  }
  if (i >= lines.length) return { value: null, nextLine: i };

  const firstLine = lines[i];
  const firstTrimmed = firstLine.trim();

  // Detect array vs object
  if (firstTrimmed.startsWith("- ") || firstTrimmed === "-") {
    // Array
    const arr: unknown[] = [];
    while (i < lines.length) {
      while (i < lines.length && (lines[i].trim() === "" || lines[i].trim().startsWith("#"))) i++;
      if (i >= lines.length) break;
      const currentIndent = getIndent(lines[i]);
      if (currentIndent < baseIndent) break;
      if (currentIndent !== baseIndent) break;
      const line = lines[i].trim();
      if (!line.startsWith("-")) break;

      const afterDash = line.slice(1).trim();
      if (afterDash === "" || afterDash.includes(":")) {
        // Multi-line item or nested object
        if (afterDash === "") {
          i++;
          if (i < lines.length) {
            const childIndent = getIndent(lines[i]);
            const child = parseYamlLines(lines, i, childIndent);
            arr.push(child.value);
            i = child.nextLine;
          } else {
            arr.push(null);
          }
        } else if (afterDash.includes(":")) {
          // Inline key: value after dash, treat as object start
          const colonIdx = afterDash.indexOf(":");
          const key = afterDash.slice(0, colonIdx).trim();
          const valStr = afterDash.slice(colonIdx + 1).trim();
          const obj: Record<string, unknown> = {};

          if (valStr) {
            obj[key] = parseYamlValue(valStr);
          } else {
            i++;
            if (i < lines.length) {
              const childIndent = getIndent(lines[i]);
              const child = parseYamlLines(lines, i, childIndent);
              obj[key] = child.value;
              i = child.nextLine;
            } else {
              obj[key] = null;
            }
          }

          // Check for additional keys at dash+2 indent
          const itemIndent = baseIndent + 2;
          while (i < lines.length) {
            while (i < lines.length && lines[i].trim() === "") i++;
            if (i >= lines.length) break;
            const ci = getIndent(lines[i]);
            if (ci !== itemIndent) break;
            const iLine = lines[i].trim();
            const iColonIdx = iLine.indexOf(":");
            if (iColonIdx === -1) break;
            const iKey = iLine.slice(0, iColonIdx).trim();
            const iValStr = iLine.slice(iColonIdx + 1).trim();
            if (iValStr) {
              obj[iKey] = parseYamlValue(iValStr);
              i++;
            } else {
              i++;
              if (i < lines.length) {
                const childIndent = getIndent(lines[i]);
                const child = parseYamlLines(lines, i, childIndent);
                obj[iKey] = child.value;
                i = child.nextLine;
              } else {
                obj[iKey] = null;
              }
            }
          }

          arr.push(obj);
          continue;
        }
      } else {
        arr.push(parseYamlValue(afterDash));
        i++;
      }
    }
    return { value: arr, nextLine: i };
  } else if (firstTrimmed.includes(":")) {
    // Object
    const obj: Record<string, unknown> = {};
    while (i < lines.length) {
      while (i < lines.length && (lines[i].trim() === "" || lines[i].trim().startsWith("#"))) i++;
      if (i >= lines.length) break;
      const currentIndent = getIndent(lines[i]);
      if (currentIndent < baseIndent) break;
      if (currentIndent !== baseIndent) break;

      const line = lines[i].trim();
      const colonIdx = line.indexOf(":");
      if (colonIdx === -1) break;

      let key = line.slice(0, colonIdx).trim();
      // Unquote key
      if (
        (key.startsWith('"') && key.endsWith('"')) ||
        (key.startsWith("'") && key.endsWith("'"))
      ) {
        key = key.slice(1, -1);
      }
      const valStr = line.slice(colonIdx + 1).trim();

      if (valStr) {
        obj[key] = parseYamlValue(valStr);
        i++;
      } else {
        i++;
        if (i < lines.length) {
          const childIndent = getIndent(lines[i]);
          if (childIndent > baseIndent) {
            const child = parseYamlLines(lines, i, childIndent);
            obj[key] = child.value;
            i = child.nextLine;
          } else {
            obj[key] = null;
          }
        } else {
          obj[key] = null;
        }
      }
    }
    return { value: obj, nextLine: i };
  }

  return { value: parseYamlValue(firstTrimmed), nextLine: i + 1 };
}

// ---

const SAMPLE_JSON = `{
  "name": "web-tools",
  "version": "1.0.0",
  "description": "Developer utility tools",
  "dependencies": {
    "react": "^18.2.0",
    "next": "^15.0.0"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build"
  },
  "features": ["json-formatter", "regex-tester", "timestamp-converter"],
  "config": {
    "debug": false,
    "maxItems": 100,
    "api": null
  }
}`;

const SAMPLE_YAML = `name: web-tools
version: "1.0.0"
description: Developer utility tools
dependencies:
  react: "^18.2.0"
  next: "^15.0.0"
scripts:
  dev: next dev
  build: next build
features:
  - json-formatter
  - regex-tester
  - timestamp-converter
config:
  debug: false
  maxItems: 100
  api: null`;

export default function JsonToYamlPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<"jsonToYaml" | "yamlToJson">("jsonToYaml");

  const convert = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }
    try {
      if (mode === "jsonToYaml") {
        const parsed = JSON.parse(input);
        setOutput(jsonToYaml(parsed));
      } else {
        const parsed = yamlToJson(input);
        setOutput(JSON.stringify(parsed, null, 2));
      }
      setError(null);
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  }, [input, mode]);

  const copyToClipboard = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const swap = () => {
    setInput(output);
    setOutput("");
    setError(null);
    setMode(mode === "jsonToYaml" ? "yamlToJson" : "jsonToYaml");
  };

  const loadSample = () => {
    if (mode === "jsonToYaml") {
      setInput(SAMPLE_JSON);
    } else {
      setInput(SAMPLE_YAML);
    }
    setOutput("");
    setError(null);
  };

  const clear = () => {
    setInput("");
    setOutput("");
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">JSON to YAML Converter</h1>
        <p className="text-muted-foreground mt-1">
          Convert between JSON and YAML formats instantly. No external libraries
          needed. 100% client-side processing.
        </p>
        <Badge variant="secondary" className="mt-2">
          No data sent to server
        </Badge>
      </div>

      <div className="flex gap-2">
        <Button
          size="lg"
          variant={mode === "jsonToYaml" ? "default" : "secondary"}
          onClick={() => {
            setMode("jsonToYaml");
            setOutput("");
            setError(null);
          }}
        >
          JSON to YAML
        </Button>
        <Button
          size="lg"
          variant={mode === "yamlToJson" ? "default" : "secondary"}
          onClick={() => {
            setMode("yamlToJson");
            setOutput("");
            setError(null);
          }}
        >
          YAML to JSON
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">
                {mode === "jsonToYaml" ? "JSON Input" : "YAML Input"}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={clear}>
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder={
                mode === "jsonToYaml"
                  ? "Paste JSON here..."
                  : "Paste YAML here..."
              }
              className="font-mono text-sm min-h-[400px] resize-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">
                {mode === "jsonToYaml" ? "YAML Output" : "JSON Output"}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                disabled={!output}
              >
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="font-mono text-sm min-h-[400px] p-3 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
                Error: {error}
              </div>
            ) : (
              <Textarea
                className="font-mono text-sm min-h-[400px] resize-none"
                value={output}
                readOnly
                placeholder="Result will appear here..."
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button size="lg" onClick={convert}>
          {mode === "jsonToYaml" ? "Convert to YAML" : "Convert to JSON"}
        </Button>
        <Button size="lg" variant="secondary" onClick={loadSample}>
          Sample
        </Button>
        <Button
          size="lg"
          variant="secondary"
          onClick={swap}
          disabled={!output}
        >
          Swap (Use Output as Input)
        </Button>
      </div>

      <section className="space-y-4 py-8 border-t">
        <Tabs defaultValue="what">
          <TabsList>
            <TabsTrigger value="what">What is JSON/YAML?</TabsTrigger>
            <TabsTrigger value="how">How to Use</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent
            value="what"
            className="mt-4 space-y-3 text-muted-foreground text-sm"
          >
            <h2 className="text-lg font-semibold text-foreground">
              What are JSON and YAML?
            </h2>
            <p>
              JSON (JavaScript Object Notation) and YAML (YAML Ain&apos;t Markup
              Language) are both human-readable data serialization formats. JSON
              uses curly braces and brackets with strict quoting rules, while YAML
              uses indentation-based syntax that is often considered more readable
              for configuration files.
            </p>
            <h3 className="text-base font-semibold text-foreground">
              When to Use Which?
            </h3>
            <p>
              JSON is the standard for APIs, web communication, and data exchange
              between services. YAML is preferred for configuration files
              (Kubernetes, Docker Compose, GitHub Actions, Ansible) due to its
              readability and support for comments. Many developers need to convert
              between the two formats frequently.
            </p>
          </TabsContent>

          <TabsContent
            value="how"
            className="mt-4 space-y-3 text-muted-foreground text-sm"
          >
            <h2 className="text-lg font-semibold text-foreground">How to Use</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Select the conversion direction: JSON to YAML or YAML to JSON.</li>
              <li>Paste your data in the input field.</li>
              <li>Click the Convert button to see the result.</li>
              <li>Copy the result or use Swap to reverse the conversion.</li>
            </ol>
          </TabsContent>

          <TabsContent
            value="faq"
            className="mt-4 space-y-4 text-muted-foreground text-sm"
          >
            <h2 className="text-lg font-semibold text-foreground">FAQ</h2>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Does this support all YAML features?
              </h3>
              <p>
                This tool supports the most common YAML features: objects, arrays,
                strings, numbers, booleans, null values, and nested structures. Advanced
                features like anchors, aliases, and multi-line strings are not
                supported in this basic implementation.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Can YAML have comments?
              </h3>
              <p>
                Yes, YAML supports comments with the # character. However, JSON does
                not support comments, so any comments in YAML will be lost when
                converting to JSON.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
