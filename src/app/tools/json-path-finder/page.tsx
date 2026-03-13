"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SAMPLE_JSON = `{
  "store": {
    "name": "DevToolKit",
    "books": [
      {
        "title": "JavaScript: The Good Parts",
        "author": "Douglas Crockford",
        "price": 15.99,
        "available": true
      },
      {
        "title": "Clean Code",
        "author": "Robert C. Martin",
        "price": 29.99,
        "available": false
      }
    ],
    "config": {
      "theme": "dark",
      "language": "en",
      "features": ["search", "filter", "sort"]
    }
  }
}`;

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

interface TreeNodeProps {
  keyName: string | null;
  value: JsonValue;
  path: string;
  depth: number;
  onSelect: (path: string, value: JsonValue) => void;
  selectedPath: string;
}

function getValuePreview(value: JsonValue): string {
  if (value === null) return "null";
  if (typeof value === "boolean") return value.toString();
  if (typeof value === "number") return value.toString();
  if (typeof value === "string") return `"${value}"`;
  if (Array.isArray(value)) return `[${value.length} items]`;
  return `{${Object.keys(value).length} keys}`;
}

function getValueType(value: JsonValue): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function TreeNode({ keyName, value, path, depth, onSelect, selectedPath }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(depth < 2);
  const isObject = value !== null && typeof value === "object";
  const isSelected = selectedPath === path;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(path, value);
    if (isObject) setExpanded((prev) => !prev);
  };

  const typeColors: Record<string, string> = {
    string: "text-green-400",
    number: "text-blue-400",
    boolean: "text-yellow-400",
    null: "text-red-400",
    array: "text-purple-400",
    object: "text-orange-400",
  };
  const typeColor = typeColors[getValueType(value)] ?? "text-foreground";

  const entries = isObject
    ? Array.isArray(value)
      ? value.map((v, i) => ({ k: String(i), v }))
      : Object.entries(value).map(([k, v]) => ({ k, v }))
    : [];

  return (
    <div className="select-none">
      <div
        onClick={handleClick}
        className={`flex items-baseline gap-1.5 px-2 py-0.5 rounded cursor-pointer text-sm transition-colors ${
          isSelected
            ? "bg-primary/20 border border-primary/40"
            : "hover:bg-muted/60"
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {isObject && (
          <span className="text-muted-foreground text-xs w-3 shrink-0">
            {expanded ? "▼" : "▶"}
          </span>
        )}
        {!isObject && <span className="w-3 shrink-0" />}

        {keyName !== null && (
          <>
            <span className="text-sky-400 font-mono shrink-0">{keyName}</span>
            <span className="text-muted-foreground shrink-0">:</span>
          </>
        )}

        {isObject ? (
          <span className={`font-mono ${typeColor}`}>
            {expanded
              ? Array.isArray(value)
                ? "["
                : "{"
              : getValuePreview(value)}
          </span>
        ) : (
          <span className={`font-mono ${typeColor} truncate`}>
            {getValuePreview(value)}
          </span>
        )}
        <span className="text-xs text-muted-foreground ml-1 shrink-0">
          {getValueType(value)}
        </span>
      </div>

      {isObject && expanded && (
        <div>
          {entries.map(({ k, v }) => {
            const childPath = Array.isArray(value)
              ? `${path}[${k}]`
              : path
              ? `${path}.${k}`
              : k;
            return (
              <TreeNode
                key={k}
                keyName={Array.isArray(value) ? null : k}
                value={v}
                path={childPath}
                depth={depth + 1}
                onSelect={onSelect}
                selectedPath={selectedPath}
              />
            );
          })}
          <div
            className="text-sm font-mono text-muted-foreground px-2 py-0.5"
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
          >
            {Array.isArray(value) ? "]" : "}"}
          </div>
        </div>
      )}
    </div>
  );
}

export default function JsonPathFinderPage() {
  const MAX_INPUT_LENGTH = 5 * 1024 * 1024;
  const [input, setInput] = useState(SAMPLE_JSON);
  const [parsed, setParsed] = useState<JsonValue | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPath, setSelectedPath] = useState("");
  const [selectedValue, setSelectedValue] = useState<JsonValue | null>(null);
  const [copiedPath, setCopiedPath] = useState(false);
  const [copiedValue, setCopiedValue] = useState(false);

  const parseJson = useCallback(() => {
    if (!input.trim()) {
      setParsed(null);
      setError(null);
      return;
    }
    try {
      setParsed(JSON.parse(input));
      setError(null);
      setSelectedPath("");
      setSelectedValue(null);
    } catch (e) {
      setError((e as Error).message);
      setParsed(null);
    }
  }, [input]);

  useEffect(() => {
    // Auto-parse sample on mount
    try {
      setParsed(JSON.parse(SAMPLE_JSON));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        parseJson();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [parseJson]);

  const handleSelect = useCallback((path: string, value: JsonValue) => {
    const jsonPath = path ? `$.${path}` : "$";
    setSelectedPath(jsonPath);
    setSelectedValue(value);
  }, []);

  const copyPath = useCallback(async () => {
    if (!selectedPath) return;
    await navigator.clipboard.writeText(selectedPath);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  }, [selectedPath]);

  const copyValue = useCallback(async () => {
    if (selectedValue === null && selectedPath === "") return;
    const text =
      typeof selectedValue === "object"
        ? JSON.stringify(selectedValue, null, 2)
        : String(selectedValue);
    await navigator.clipboard.writeText(text);
    setCopiedValue(true);
    setTimeout(() => setCopiedValue(false), 2000);
  }, [selectedValue, selectedPath]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">JSON Path Finder</h1>
        <p className="text-muted-foreground mt-1">
          Explore JSON as an interactive tree. Click any node to get its
          JSONPath expression instantly.
        </p>
        <Badge variant="secondary" className="mt-2">
          No data sent to server
        </Badge>
      </div>

      {/* Input */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">JSON Input</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setInput(SAMPLE_JSON)}
              >
                Sample
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setInput("");
                  setParsed(null);
                  setError(null);
                  setSelectedPath("");
                  setSelectedValue(null);
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Paste your JSON here..."
            className="font-mono text-sm min-h-[160px] resize-none"
            value={input}
            onChange={(e) => { if (e.target.value.length > MAX_INPUT_LENGTH) { alert("Input too large. Maximum size is 5MB."); return; } setInput(e.target.value); }}
          />
        </CardContent>
      </Card>

      {/* Parse Button */}
      <div className="flex gap-3 items-center">
        <Button size="lg" onClick={parseJson}>
          Parse JSON
        </Button>
        <span className="text-xs text-muted-foreground">Ctrl+Enter</span>
      </div>

      {/* Error */}
      {error && (
        <div className="font-mono text-sm p-3 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
          Error: {error}
        </div>
      )}

      {/* Tree + Selected Path */}
      {parsed !== null && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Tree */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">
                JSON Tree
                <span className="ml-2 font-normal text-muted-foreground text-xs">
                  Click a node to get its path
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto max-h-[500px] rounded-md bg-muted/50 py-2 border border-border">
                <TreeNode
                  keyName={null}
                  value={parsed}
                  path=""
                  depth={0}
                  onSelect={handleSelect}
                  selectedPath={
                    selectedPath.startsWith("$.")
                      ? selectedPath.slice(2)
                      : selectedPath === "$"
                      ? ""
                      : selectedPath
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Selected Node Info */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Selected Node</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedPath ? (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">JSONPath</p>
                      <div className="flex items-center gap-2 p-2 rounded-md bg-muted border border-border">
                        <code className="font-mono text-sm flex-1 break-all">
                          {selectedPath}
                        </code>
                        <Button variant="ghost" size="sm" onClick={copyPath} className="shrink-0">
                          {copiedPath ? "Copied!" : "Copy"}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Value</p>
                      <div className="flex items-start gap-2 p-2 rounded-md bg-muted border border-border">
                        <pre className="font-mono text-xs flex-1 break-all whitespace-pre-wrap max-h-48 overflow-auto">
                          {typeof selectedValue === "object"
                            ? JSON.stringify(selectedValue, null, 2)
                            : String(selectedValue)}
                        </pre>
                        <Button variant="ghost" size="sm" onClick={copyValue} className="shrink-0">
                          {copiedValue ? "Copied!" : "Copy"}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Type</p>
                      <Badge variant="secondary">
                        {selectedValue === null
                          ? "null"
                          : Array.isArray(selectedValue)
                          ? "array"
                          : typeof selectedValue}
                      </Badge>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Click any node in the tree to see its JSONPath here.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Related Tools */}
      <section className="py-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "JSON Formatter", href: "/tools/json-formatter" },
            { name: "JSON to YAML", href: "/tools/json-to-yaml" },
            { name: "JWT Decoder", href: "/tools/jwt-decoder" },
            { name: "Diff Checker", href: "/tools/diff-checker" },
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

      {/* SEO Content */}
      <section className="space-y-4 py-8 border-t">
        <Tabs defaultValue="what">
          <TabsList>
            <TabsTrigger value="what">What is JSONPath?</TabsTrigger>
            <TabsTrigger value="how">How to Use</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="what" className="prose prose-invert max-w-none mt-4 space-y-3 text-muted-foreground text-sm">
            <h2 className="text-lg font-semibold text-foreground">What is JSONPath?</h2>
            <p>
              JSONPath is a query language for JSON, similar to XPath for XML.
              It provides a standardized way to navigate and extract data from
              JSON documents using path expressions. For example,{" "}
              <code>$.store.books[0].title</code> selects the title of the first
              book in a store object.
            </p>
            <h3 className="text-base font-semibold text-foreground">JSONPath Syntax</h3>
            <p>
              Paths start with <code>$</code> (the root). Dots (<code>.</code>)
              navigate into objects, and square brackets (<code>[n]</code>)
              index into arrays. Wildcards (<code>*</code>) and filters
              (<code>[?(...)]</code>) allow more complex queries.
            </p>
          </TabsContent>

          <TabsContent value="how" className="prose prose-invert max-w-none mt-4 space-y-3 text-muted-foreground text-sm">
            <h2 className="text-lg font-semibold text-foreground">How to Use This Tool</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Paste your JSON into the input textarea.</li>
              <li>Click &quot;Parse JSON&quot; (or Ctrl+Enter) to build the tree.</li>
              <li>Click any node in the tree to see its JSONPath expression.</li>
              <li>Copy the path or the node value with the Copy buttons.</li>
              <li>Use the sample JSON to explore the tool quickly.</li>
            </ol>
          </TabsContent>

          <TabsContent value="faq" className="prose prose-invert max-w-none mt-4 space-y-4 text-muted-foreground text-sm">
            <h2 className="text-lg font-semibold text-foreground">Frequently Asked Questions</h2>
            <div>
              <h3 className="text-sm font-semibold text-foreground">What libraries use JSONPath?</h3>
              <p>
                JSONPath is supported in many languages and tools: Python
                (jsonpath-ng), JavaScript (jsonpath-plus), Java (Jayway
                JsonPath), and tools like Postman and AWS Step Functions.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Is there a size limit?</h3>
              <p>
                Since everything runs in your browser, the limit depends on your
                device. JSON files up to several MB will work smoothly. Very
                deeply nested JSON (100+ levels) may affect tree rendering
                performance.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
