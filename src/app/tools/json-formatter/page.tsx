"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function JsonFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const formatJson = useCallback((indent: number = 2) => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, indent));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  }, [input]);

  const minifyJson = useCallback(() => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  }, [input]);

  const validateJson = useCallback(() => {
    if (!input.trim()) {
      setError(null);
      return;
    }
    try {
      JSON.parse(input);
      setError(null);
      setOutput("Valid JSON!");
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  }, [input]);

  const copyToClipboard = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const loadSample = () => {
    const sample = JSON.stringify(
      {
        name: "DevToolKit",
        version: "1.0.0",
        features: ["JSON Formatter", "Diff Checker", "JWT Decoder"],
        config: { theme: "dark", language: "en" },
      },
      null,
      2
    );
    setInput(sample);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">JSON Formatter & Validator</h1>
        <p className="text-muted-foreground mt-1">
          Format, validate, and minify JSON data. 100% client-side — your data
          never leaves your browser.
        </p>
        <Badge variant="secondary" className="mt-2">
          No data sent to server
        </Badge>
      </div>

      {/* Tool */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Input</CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={loadSample}>
                  Sample
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setInput("");
                    setOutput("");
                    setError(null);
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
              className="font-mono text-sm min-h-[400px] resize-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Output */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Output</CardTitle>
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
                placeholder="Formatted output will appear here..."
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button size="lg" onClick={() => formatJson(2)}>
          Format (2 spaces)
        </Button>
        <Button size="lg" variant="secondary" onClick={() => formatJson(4)}>
          Format (4 spaces)
        </Button>
        <Button size="lg" variant="secondary" onClick={minifyJson}>
          Minify
        </Button>
        <Button size="lg" variant="secondary" onClick={validateJson}>
          Validate
        </Button>
      </div>

      {/* SEO Content */}
      <section className="space-y-4 py-8 border-t">
        <Tabs defaultValue="what">
          <TabsList>
            <TabsTrigger value="what">What is JSON?</TabsTrigger>
            <TabsTrigger value="how">How to Use</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="what" className="prose prose-invert max-w-none mt-4 space-y-3 text-muted-foreground text-sm">
            <h2 className="text-lg font-semibold text-foreground">
              What is JSON?
            </h2>
            <p>
              JSON (JavaScript Object Notation) is a lightweight data
              interchange format that is easy for humans to read and write and
              easy for machines to parse and generate. It is widely used in web
              APIs, configuration files, and data storage.
            </p>
            <h3 className="text-base font-semibold text-foreground">
              Why Format JSON?
            </h3>
            <p>
              Raw JSON data is often minified (compressed) to reduce file size
              during transmission. While efficient for machines, minified JSON
              is nearly impossible for developers to read and debug. A JSON
              formatter adds proper indentation and line breaks, making the
              data structure clear and easy to understand.
            </p>
            <h3 className="text-base font-semibold text-foreground">
              Why Use a Client-Side JSON Formatter?
            </h3>
            <p>
              Many online JSON formatters send your data to their servers for
              processing. This poses a security risk, especially when working
              with sensitive API responses, authentication tokens, or
              proprietary data. Our tool processes everything directly in your
              browser using JavaScript — your data never leaves your device.
            </p>
          </TabsContent>

          <TabsContent value="how" className="prose prose-invert max-w-none mt-4 space-y-3 text-muted-foreground text-sm">
            <h2 className="text-lg font-semibold text-foreground">
              How to Use This Tool
            </h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Paste your JSON data into the input field on the left.
              </li>
              <li>
                Click &quot;Format&quot; to beautify with 2 or 4 space
                indentation.
              </li>
              <li>
                Click &quot;Minify&quot; to compress JSON into a single line.
              </li>
              <li>
                Click &quot;Validate&quot; to check if your JSON is valid.
              </li>
              <li>
                Click &quot;Copy&quot; to copy the result to your clipboard.
              </li>
            </ol>
          </TabsContent>

          <TabsContent value="faq" className="prose prose-invert max-w-none mt-4 space-y-4 text-muted-foreground text-sm">
            <h2 className="text-lg font-semibold text-foreground">
              Frequently Asked Questions
            </h2>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Is my data safe?
              </h3>
              <p>
                Yes. This tool runs entirely in your browser. No data is
                transmitted to any server. You can verify this by checking
                your browser&apos;s network tab.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                What is the maximum JSON size I can format?
              </h3>
              <p>
                Since processing happens in your browser, the limit depends on
                your device&apos;s memory. Typically, JSON files up to 10MB
                work smoothly.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Can I use this tool offline?
              </h3>
              <p>
                Once the page is loaded, the tool works without an internet
                connection since all processing is done locally.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
