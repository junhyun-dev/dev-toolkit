"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function minifyCSS(css: string): string {
  return css
    // Remove comments
    .replace(/\/\*[\s\S]*?\*\//g, "")
    // Remove whitespace around special characters
    .replace(/\s*([{}:;,>~+])\s*/g, "$1")
    // Collapse multiple spaces/newlines
    .replace(/\s+/g, " ")
    // Remove leading/trailing space
    .trim()
    // Remove trailing semicolon before closing brace
    .replace(/;}/g, "}");
}

function beautifyCSS(css: string): string {
  // First minify to normalize
  let result = minifyCSS(css);
  // Add newline + indent after {
  result = result.replace(/\{/g, " {\n  ");
  // Add newline after ;
  result = result.replace(/;/g, ";\n  ");
  // Add newline before }
  result = result.replace(/\s*}/g, "\n}\n");
  // Add newline after ,  in selectors (before {)
  result = result.replace(/,(?=[^}]*\{)/g, ",\n");
  // Clean up extra blank lines
  result = result.replace(/\n{3,}/g, "\n\n");
  return result.trim();
}

function byteSize(str: string): number {
  return new TextEncoder().encode(str).length;
}

const SAMPLE_CSS = `/* Navigation styles */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background-color: #1a1a2e;
  border-bottom: 1px solid #16213e;
}

.navbar__logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: #e94560;
}

/* Button component */
.btn {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.btn--primary {
  background-color: #e94560;
  color: #ffffff;
}

.btn--primary:hover {
  background-color: #c73652;
}`;

export default function CssMinifierPage() {
  const MAX_INPUT_LENGTH = 5 * 1024 * 1024;
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const inputBytes = byteSize(input);
  const outputBytes = byteSize(output);
  const savings =
    inputBytes > 0
      ? Math.round(((inputBytes - outputBytes) / inputBytes) * 100)
      : 0;

  const handleMinify = useCallback(() => {
    if (!input.trim()) return;
    setOutput(minifyCSS(input));
  }, [input]);

  const handleBeautify = useCallback(() => {
    if (!input.trim()) return;
    setOutput(beautifyCSS(input));
  }, [input]);

  const copyToClipboard = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleMinify();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleMinify]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">CSS Minifier & Beautifier</h1>
        <p className="text-muted-foreground mt-1">
          Minify CSS to reduce file size, or beautify it for readability. 100%
          client-side — your code never leaves your browser.
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
              <CardTitle className="text-sm">
                Input
                {inputBytes > 0 && (
                  <span className="ml-2 font-normal text-muted-foreground">
                    {inputBytes} bytes
                  </span>
                )}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setInput(SAMPLE_CSS)}
                >
                  Sample
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setInput("");
                    setOutput("");
                  }}
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste your CSS here..."
              className="font-mono text-sm min-h-[400px] resize-none"
              value={input}
              onChange={(e) => { if (e.target.value.length > MAX_INPUT_LENGTH) { alert("Input too large. Maximum size is 5MB."); return; } setInput(e.target.value); }}
            />
          </CardContent>
        </Card>

        {/* Output */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">
                Output
                {outputBytes > 0 && (
                  <span className="ml-2 font-normal text-muted-foreground">
                    {outputBytes} bytes
                  </span>
                )}
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
            <Textarea
              className="font-mono text-sm min-h-[400px] resize-none"
              value={output}
              readOnly
              placeholder="Output will appear here..."
            />
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons + Stats */}
      <div className="flex flex-wrap items-center gap-3">
        <Button size="lg" onClick={handleMinify}>
          Minify
        </Button>
        <span className="text-xs text-muted-foreground">Ctrl+Enter</span>
        <Button size="lg" variant="secondary" onClick={handleBeautify}>
          Beautify
        </Button>
        {output && inputBytes > 0 && (
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">
              {inputBytes} → {outputBytes} bytes
            </span>
            <Badge variant={savings > 0 ? "default" : "secondary"}>
              {savings > 0 ? `-${savings}% saved` : "No change"}
            </Badge>
          </div>
        )}
      </div>

      {/* Related Tools */}
      <section className="py-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Tailwind CSS Converter", href: "/tools/tailwind-converter" },
            { name: "HTML Entity Encoder", href: "/tools/html-entity-encoder" },
            { name: "JSON Formatter", href: "/tools/json-formatter" },
            { name: "Markdown Preview", href: "/tools/markdown-preview" },
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
            <TabsTrigger value="what">What is CSS Minification?</TabsTrigger>
            <TabsTrigger value="how">How to Use</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="what" className="prose prose-invert max-w-none mt-4 space-y-3 text-muted-foreground text-sm">
            <h2 className="text-lg font-semibold text-foreground">What is CSS Minification?</h2>
            <p>
              CSS minification is the process of removing all unnecessary
              characters from CSS code without changing its functionality. This
              includes whitespace, newlines, comments, and redundant semicolons.
              The result is a smaller file that loads faster in browsers.
            </p>
            <h3 className="text-base font-semibold text-foreground">Why Minify CSS?</h3>
            <p>
              Every byte saved reduces page load time. Smaller CSS files mean
              faster parsing, faster rendering, and better Core Web Vitals scores
              — which directly impact SEO rankings and user experience.
            </p>
          </TabsContent>

          <TabsContent value="how" className="prose prose-invert max-w-none mt-4 space-y-3 text-muted-foreground text-sm">
            <h2 className="text-lg font-semibold text-foreground">How to Use This Tool</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Paste your CSS into the input field on the left.</li>
              <li>Click &quot;Minify&quot; (or Ctrl+Enter) to compress the CSS.</li>
              <li>Click &quot;Beautify&quot; to format and indent the CSS for readability.</li>
              <li>Check the byte savings shown below the buttons.</li>
              <li>Click &quot;Copy&quot; to copy the result to your clipboard.</li>
            </ol>
          </TabsContent>

          <TabsContent value="faq" className="prose prose-invert max-w-none mt-4 space-y-4 text-muted-foreground text-sm">
            <h2 className="text-lg font-semibold text-foreground">Frequently Asked Questions</h2>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Will minification break my CSS?</h3>
              <p>
                No. Minification only removes characters that have no effect on
                the browser&apos;s interpretation of the CSS rules. The rendered
                output will be identical.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">How much can I expect to save?</h3>
              <p>
                Typical savings range from 20–40% for hand-written CSS. Files
                with many comments can see even greater reductions.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
