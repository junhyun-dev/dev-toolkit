"use client";

import { useState, useCallback, useEffect } from "react";
import { diffLines, type Change } from "diff";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DiffCheckerPage() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [result, setResult] = useState<Change[] | null>(null);
  const [stats, setStats] = useState({ added: 0, removed: 0 });

  const compareDiff = useCallback(() => {
    const changes = diffLines(left, right);
    setResult(changes);
    setStats({
      added: changes.filter((c) => c.added).length,
      removed: changes.filter((c) => c.removed).length,
    });
  }, [left, right]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        compareDiff();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [compareDiff]);

  const clearAll = () => {
    setLeft("");
    setRight("");
    setResult(null);
    setStats({ added: 0, removed: 0 });
  };

  const loadSample = () => {
    setLeft(`function greet(name) {
  console.log("Hello, " + name);
  return true;
}

const result = greet("World");`);
    setRight(`function greet(name, greeting = "Hello") {
  console.log(greeting + ", " + name + "!");
  return true;
}

const message = greet("World", "Hi");
console.log(message);`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Diff Checker</h1>
        <p className="text-muted-foreground mt-1">
          Compare two texts or code blocks side by side. 100% client-side
          processing.
        </p>
        <Badge variant="secondary" className="mt-2">
          No data sent to server
        </Badge>
      </div>

      {/* Input */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Original Text</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste original text here..."
              className="font-mono text-sm min-h-[300px] resize-none"
              value={left}
              onChange={(e) => setLeft(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Modified Text</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste modified text here..."
              className="font-mono text-sm min-h-[300px] resize-none"
              value={right}
              onChange={(e) => setRight(e.target.value)}
            />
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button size="lg" onClick={compareDiff}>
          Compare
        </Button>
        <span className="text-xs text-muted-foreground ml-2">Ctrl+Enter</span>
        <Button size="lg" variant="secondary" onClick={loadSample}>
          Load Sample
        </Button>
        <Button size="lg" variant="secondary" onClick={clearAll}>
          Clear
        </Button>
      </div>

      {/* Result */}
      {result && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <CardTitle className="text-sm">Differences</CardTitle>
              <Badge variant="outline" className="text-xs text-green-500">
                +{stats.added} added
              </Badge>
              <Badge variant="outline" className="text-xs text-red-500">
                -{stats.removed} removed
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-sm rounded-md border overflow-auto max-h-[500px]">
              {result.map((part, i) => (
                <div
                  key={i}
                  className={`px-3 py-0.5 whitespace-pre-wrap ${
                    part.added
                      ? "bg-green-500/10 text-green-400 border-l-2 border-green-500"
                      : part.removed
                        ? "bg-red-500/10 text-red-400 border-l-2 border-red-500"
                        : "text-muted-foreground"
                  }`}
                >
                  {part.added ? "+ " : part.removed ? "- " : "  "}
                  {part.value}
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
            { name: "JSON Formatter", href: "/tools/json-formatter" },
            { name: "Regex Tester", href: "/tools/regex-tester" },
            { name: "SQL Formatter", href: "/tools/sql-formatter" },
            { name: "Markdown Preview", href: "/tools/markdown-preview" },
          ].map((tool) => (
            <a key={tool.href} href={tool.href} className="text-xs px-3 py-1.5 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors">
              {tool.name}
            </a>
          ))}
        </div>
      </section>

      {/* SEO Content */}
      <section className="space-y-4 py-8 border-t">
        <Tabs defaultValue="what">
          <TabsList>
            <TabsTrigger value="what">About Diff Checker</TabsTrigger>
            <TabsTrigger value="how">How to Use</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="what" className="mt-4 space-y-3 text-muted-foreground text-sm">
            <h2 className="text-lg font-semibold text-foreground">
              What is a Diff Checker?
            </h2>
            <p>
              A diff checker (also known as a text comparison tool) allows you
              to compare two blocks of text or code and see the differences
              between them. It highlights additions, deletions, and
              modifications line by line.
            </p>
            <h3 className="text-base font-semibold text-foreground">
              Common Use Cases
            </h3>
            <p>
              Developers use diff checkers for code reviews, comparing
              configuration files, tracking changes between document versions,
              and debugging by comparing expected vs actual outputs. It is an
              essential tool in any developer&apos;s workflow.
            </p>
          </TabsContent>

          <TabsContent value="how" className="mt-4 space-y-3 text-muted-foreground text-sm">
            <h2 className="text-lg font-semibold text-foreground">
              How to Use
            </h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Paste the original text in the left panel.</li>
              <li>Paste the modified text in the right panel.</li>
              <li>Click &quot;Compare&quot; to see the differences.</li>
              <li>
                Green lines indicate additions, red lines indicate removals.
              </li>
            </ol>
          </TabsContent>

          <TabsContent value="faq" className="mt-4 space-y-4 text-muted-foreground text-sm">
            <h2 className="text-lg font-semibold text-foreground">FAQ</h2>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Is there a file size limit?
              </h3>
              <p>
                Processing happens in your browser, so it depends on your
                device. Most texts up to 1MB compare instantly.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Can I compare code files?
              </h3>
              <p>
                Yes! This tool works with any plain text including source code
                in any programming language.
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
