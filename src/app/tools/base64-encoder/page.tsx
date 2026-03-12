"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Base64EncoderPage() {
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
      setOutput(btoa(unescape(encodeURIComponent(input))));
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
      setOutput(decodeURIComponent(escape(atob(input.trim()))));
      setError(null);
    } catch (e) {
      setError("Invalid Base64 string. Please check your input.");
      setOutput("");
    }
  }, [input]);

  const handleAction = useCallback(() => {
    if (mode === "encode") encode();
    else decode();
  }, [mode, encode, decode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleAction();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleAction]);

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
    setMode(mode === "encode" ? "decode" : "encode");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Base64 Encoder & Decoder</h1>
        <p className="text-muted-foreground mt-1">
          Encode text to Base64 or decode Base64 to text. 100% client-side
          processing.
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
              <CardTitle className="text-sm">
                {mode === "encode" ? "Text Input" : "Base64 Input"}
              </CardTitle>
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
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder={
                mode === "encode"
                  ? "Enter text to encode..."
                  : "Enter Base64 string to decode..."
              }
              className="font-mono text-sm min-h-[300px] resize-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">
                {mode === "encode" ? "Base64 Output" : "Text Output"}
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
              <div className="font-mono text-sm min-h-[300px] p-3 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
                Error: {error}
              </div>
            ) : (
              <Textarea
                className="font-mono text-sm min-h-[300px] resize-none"
                value={output}
                readOnly
                placeholder="Result will appear here..."
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button size="lg" onClick={handleAction}>
          {mode === "encode" ? "Encode to Base64" : "Decode from Base64"}
        </Button>
        <span className="text-xs text-muted-foreground ml-2">Ctrl+Enter</span>
        <Button size="lg" variant="secondary" onClick={swap} disabled={!output}>
          Swap (Use Output as Input)
        </Button>
      </div>

      {/* Related Tools */}
      <section className="py-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "URL Encoder", href: "/tools/url-encoder" },
            { name: "JWT Decoder", href: "/tools/jwt-decoder" },
            { name: "Hash Generator", href: "/tools/hash-generator" },
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
            <TabsTrigger value="what">What is Base64?</TabsTrigger>
            <TabsTrigger value="how">How to Use</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent
            value="what"
            className="mt-4 space-y-3 text-muted-foreground text-sm"
          >
            <h2 className="text-lg font-semibold text-foreground">
              What is Base64 Encoding?
            </h2>
            <p>
              Base64 is a binary-to-text encoding scheme that represents binary
              data using a set of 64 printable ASCII characters. It is commonly
              used to embed binary data in text-based formats such as JSON, XML,
              HTML, and email attachments (MIME). The encoding converts every 3
              bytes of input into 4 ASCII characters, making it roughly 33%
              larger than the original data.
            </p>
            <h3 className="text-base font-semibold text-foreground">
              Common Use Cases
            </h3>
            <p>
              Developers frequently use Base64 encoding when working with APIs
              that require binary data in string format, embedding images
              directly in CSS or HTML using data URIs, encoding authentication
              credentials in HTTP headers (Basic Auth), and storing binary data
              in databases or configuration files that only support text.
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
              <li>Paste your text or Base64 string in the input field.</li>
              <li>Click the action button to convert.</li>
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
                Is Base64 encryption?
              </h3>
              <p>
                No. Base64 is an encoding scheme, not encryption. Anyone can
                decode a Base64 string without a key. It should never be used to
                protect sensitive data.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Does this tool support file encoding?
              </h3>
              <p>
                Currently this tool encodes and decodes text strings. File to
                Base64 conversion will be available in a future update.
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
