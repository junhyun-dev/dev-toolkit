"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function UrlEncoderPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  const encode = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }
    try {
      setOutput(encodeURIComponent(input));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  }, [input]);

  const encodeAll = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }
    try {
      setOutput(
        encodeURIComponent(input).replace(
          /[!'()*~]/g,
          (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase()
        )
      );
      setError(null);
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  }, [input]);

  const decode = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }
    try {
      setOutput(decodeURIComponent(input.trim()));
      setError(null);
    } catch (e) {
      setError("Invalid URL-encoded string. Please check your input.");
      setOutput("");
    }
  }, [input]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (mode === "encode") encode();
        else decode();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mode, encode, decode]);

  const copyToClipboard = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const loadSample = () => {
    setInput("https://example.com/search?q=hello world&lang=한국어&page=1");
    setMode("encode");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">URL Encoder & Decoder</h1>
        <p className="text-muted-foreground mt-1">
          Encode or decode URLs and query parameters. Handles Unicode, special
          characters, and percent-encoding. 100% client-side.
        </p>
        <Badge variant="secondary" className="mt-2">
          No data sent to server
        </Badge>
      </div>

      <div className="flex gap-2">
        <Button
          size="lg"
          variant={mode === "encode" ? "default" : "secondary"}
          onClick={() => setMode("encode")}
        >
          Encode
        </Button>
        <Button
          size="lg"
          variant={mode === "decode" ? "default" : "secondary"}
          onClick={() => setMode("decode")}
        >
          Decode
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
              placeholder={
                mode === "encode"
                  ? "Enter URL or text to encode..."
                  : "Enter URL-encoded string to decode..."
              }
              className="font-mono text-sm min-h-[250px] resize-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </CardContent>
        </Card>

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
              <div className="font-mono text-sm min-h-[250px] p-3 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
                Error: {error}
              </div>
            ) : (
              <Textarea
                className="font-mono text-sm min-h-[250px] resize-none"
                value={output}
                readOnly
                placeholder="Result will appear here..."
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {mode === "encode" ? (
          <>
            <Button size="lg" onClick={encode}>
              Encode (Standard)
            </Button>
            <Button size="lg" variant="secondary" onClick={encodeAll}>
              Encode All Characters
            </Button>
          </>
        ) : (
          <Button size="lg" onClick={decode}>
            Decode URL
          </Button>
        )}
        <span className="text-xs text-muted-foreground ml-2">Ctrl+Enter</span>
      </div>

      {/* Related Tools */}
      <section className="py-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Base64 Encoder", href: "/tools/base64-encoder" },
            { name: "JSON Formatter", href: "/tools/json-formatter" },
            { name: "Hash Generator", href: "/tools/hash-generator" },
            { name: "Regex Tester", href: "/tools/regex-tester" },
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
            <TabsTrigger value="what">What is URL Encoding?</TabsTrigger>
            <TabsTrigger value="how">How to Use</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent
            value="what"
            className="mt-4 space-y-3 text-muted-foreground text-sm"
          >
            <h2 className="text-lg font-semibold text-foreground">
              What is URL Encoding?
            </h2>
            <p>
              URL encoding, also known as percent-encoding, is a mechanism for
              converting special characters into a format that can be safely
              transmitted within a URL. Characters that have special meaning in
              URLs (such as spaces, ampersands, and question marks) or
              non-ASCII characters (such as Korean, Chinese, or emoji) are
              replaced with a percent sign followed by their hexadecimal
              representation.
            </p>
            <h3 className="text-base font-semibold text-foreground">
              Why is URL Encoding Needed?
            </h3>
            <p>
              URLs can only contain a limited set of ASCII characters. When you
              need to include spaces, special characters, or international text
              in a URL or query parameter, they must be percent-encoded to
              ensure the URL is valid and the data is transmitted correctly.
              Without proper encoding, URLs can break or be misinterpreted by
              browsers and servers.
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
              <li>Select Encode or Decode mode.</li>
              <li>Paste your URL or encoded string.</li>
              <li>Click Encode or Decode to convert.</li>
              <li>Use &quot;Encode All Characters&quot; to encode every non-alphanumeric character.</li>
            </ol>
          </TabsContent>

          <TabsContent
            value="faq"
            className="mt-4 space-y-4 text-muted-foreground text-sm"
          >
            <h2 className="text-lg font-semibold text-foreground">FAQ</h2>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                What is the difference between Standard and Encode All?
              </h3>
              <p>
                Standard encoding only converts characters that are not allowed
                in URLs. Encode All additionally converts characters like
                exclamation marks, parentheses, and tildes that are technically
                allowed but may cause issues in some systems.
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
