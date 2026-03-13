"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ENTITY_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
  "¢": "&cent;",
  "£": "&pound;",
  "¥": "&yen;",
  "€": "&euro;",
  "©": "&copy;",
  "®": "&reg;",
  "™": "&trade;",
  "°": "&deg;",
  "±": "&plusmn;",
  "×": "&times;",
  "÷": "&divide;",
  "½": "&frac12;",
  "¼": "&frac14;",
  "¾": "&frac34;",
  "→": "&rarr;",
  "←": "&larr;",
  "↑": "&uarr;",
  "↓": "&darr;",
  "•": "&bull;",
  "…": "&hellip;",
  "–": "&ndash;",
  "—": "&mdash;",
  " ": "&nbsp;",
};

const REVERSE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(ENTITY_MAP).map(([k, v]) => [v, k])
);

function encodeEntities(text: string): string {
  return text.replace(
    /[&<>"'¢£¥€©®™°±×÷½¼¾→←↑↓•…–— ]/g,
    (char) => ENTITY_MAP[char] ?? char
  );
}

function decodeEntities(text: string): string {
  // Named entities
  let result = text.replace(/&[a-zA-Z]+;/g, (entity) => REVERSE_MAP[entity] ?? entity);
  // Numeric decimal entities
  result = result.replace(/&#(\d+);/g, (_, code) =>
    String.fromCharCode(parseInt(code, 10))
  );
  // Numeric hex entities
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, code) =>
    String.fromCharCode(parseInt(code, 16))
  );
  return result;
}

type Mode = "encode" | "decode";

export default function HtmlEntityEncoderPage() {
  const MAX_INPUT_LENGTH = 5 * 1024 * 1024;
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const process = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      return;
    }
    setOutput(mode === "encode" ? encodeEntities(input) : decodeEntities(input));
  }, [input, mode]);

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
        process();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [process]);

  const swapIO = () => {
    setInput(output);
    setOutput("");
  };

  const ENCODE_SAMPLE = `<div class="hero">
  <h1>Hello & Welcome!</h1>
  <p>Price: $10 < $20 > $5 © 2024</p>
</div>`;

  const DECODE_SAMPLE = `&lt;div class=&quot;hero&quot;&gt;
  &lt;h1&gt;Hello &amp; Welcome!&lt;/h1&gt;
  &lt;p&gt;Price: $10 &lt; $20 &gt; $5 &copy; 2024&lt;/p&gt;
&lt;/div&gt;`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">HTML Entity Encoder & Decoder</h1>
        <p className="text-muted-foreground mt-1">
          Convert special characters to HTML entities and back. 100%
          client-side — your data never leaves your browser.
        </p>
        <Badge variant="secondary" className="mt-2">
          No data sent to server
        </Badge>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => { setMode("encode"); setOutput(""); }}
          className={`px-4 py-2 rounded-md text-sm transition-colors ${
            mode === "encode"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Encode → HTML Entities
        </button>
        <button
          onClick={() => { setMode("decode"); setOutput(""); }}
          className={`px-4 py-2 rounded-md text-sm transition-colors ${
            mode === "decode"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Decode → Plain Text
        </button>
      </div>

      {/* Tool */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">
                {mode === "encode" ? "Plain Text Input" : "HTML Entities Input"}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setInput(mode === "encode" ? ENCODE_SAMPLE : DECODE_SAMPLE)
                  }
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
              placeholder={
                mode === "encode"
                  ? "Enter text with special characters..."
                  : "Enter HTML with entities like &amp;lt; &amp;gt; &amp;amp;..."
              }
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
                {mode === "encode" ? "HTML Entities Output" : "Plain Text Output"}
              </CardTitle>
              <div className="flex gap-2">
                {output && (
                  <Button variant="ghost" size="sm" onClick={swapIO}>
                    ↕ Swap
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  disabled={!output}
                >
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
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

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 items-center">
        <Button size="lg" onClick={process}>
          {mode === "encode" ? "Encode" : "Decode"}
        </Button>
        <span className="text-xs text-muted-foreground">Ctrl+Enter</span>
      </div>

      {/* Reference Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Common HTML Entities Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { char: "<", entity: "&lt;" },
              { char: ">", entity: "&gt;" },
              { char: "&", entity: "&amp;" },
              { char: '"', entity: "&quot;" },
              { char: "'", entity: "&apos;" },
              { char: "©", entity: "&copy;" },
              { char: "®", entity: "&reg;" },
              { char: "™", entity: "&trade;" },
              { char: "€", entity: "&euro;" },
              { char: "£", entity: "&pound;" },
              { char: "°", entity: "&deg;" },
              { char: "…", entity: "&hellip;" },
            ].map(({ char, entity }) => (
              <div
                key={entity}
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted text-sm font-mono"
              >
                <span className="text-foreground font-bold w-4 text-center">{char}</span>
                <span className="text-muted-foreground">{entity}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Related Tools */}
      <section className="py-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "URL Encoder", href: "/tools/url-encoder" },
            { name: "Base64 Encoder", href: "/tools/base64-encoder" },
            { name: "Markdown Preview", href: "/tools/markdown-preview" },
            { name: "CSS Minifier", href: "/tools/css-minifier" },
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
            <TabsTrigger value="what">What are HTML Entities?</TabsTrigger>
            <TabsTrigger value="how">How to Use</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="what" className="prose prose-invert max-w-none mt-4 space-y-3 text-muted-foreground text-sm">
            <h2 className="text-lg font-semibold text-foreground">What are HTML Entities?</h2>
            <p>
              HTML entities are special codes used to represent characters that
              have special meaning in HTML, or characters that cannot be easily
              typed on a keyboard. For example, the less-than sign ({`<`}) must be
              written as &amp;lt; in HTML to prevent the browser from interpreting
              it as the start of a tag.
            </p>
            <h3 className="text-base font-semibold text-foreground">When Do You Need Them?</h3>
            <p>
              Any time you need to display code examples, user-generated content,
              or special symbols in HTML. Without proper encoding, characters like
              &lt;, &gt;, and &amp; can break your HTML structure or create
              security vulnerabilities (XSS attacks).
            </p>
          </TabsContent>

          <TabsContent value="how" className="prose prose-invert max-w-none mt-4 space-y-3 text-muted-foreground text-sm">
            <h2 className="text-lg font-semibold text-foreground">How to Use This Tool</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Select &quot;Encode&quot; to convert plain text to HTML entities.</li>
              <li>Select &quot;Decode&quot; to convert HTML entities back to plain text.</li>
              <li>Paste your text into the input field.</li>
              <li>Click the action button (or Ctrl+Enter) to process.</li>
              <li>Use &quot;Swap&quot; to reverse input and output quickly.</li>
              <li>Click &quot;Copy&quot; to copy the result.</li>
            </ol>
          </TabsContent>

          <TabsContent value="faq" className="prose prose-invert max-w-none mt-4 space-y-4 text-muted-foreground text-sm">
            <h2 className="text-lg font-semibold text-foreground">Frequently Asked Questions</h2>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Does this support numeric entities like &amp;#169;?</h3>
              <p>
                Yes. The decoder handles named entities (&amp;copy;), decimal
                numeric entities (&amp;#169;), and hex numeric entities
                (&amp;#xa9;).
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Is this safe to use with sensitive content?</h3>
              <p>
                Absolutely. All processing happens in your browser. Nothing is
                sent to any server.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
