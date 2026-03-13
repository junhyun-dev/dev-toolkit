"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DecodedJWT {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  isExpired: boolean | null;
  expiresAt: string | null;
  issuedAt: string | null;
}

function base64UrlDecode(str: string): string {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return atob(padded);
}

function decodeJWT(token: string): DecodedJWT {
  const parts = token.trim().split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT: must have exactly 3 parts separated by dots");
  }

  const header = JSON.parse(base64UrlDecode(parts[0]));
  const payload = JSON.parse(base64UrlDecode(parts[1]));

  let isExpired: boolean | null = null;
  let expiresAt: string | null = null;
  let issuedAt: string | null = null;

  if (payload.exp) {
    const expDate = new Date(payload.exp * 1000);
    isExpired = expDate < new Date();
    expiresAt = expDate.toISOString();
  }

  if (payload.iat) {
    issuedAt = new Date(payload.iat * 1000).toISOString();
  }

  return {
    header,
    payload,
    signature: parts[2],
    isExpired,
    expiresAt,
    issuedAt,
  };
}

export default function JwtDecoderPage() {
  const MAX_INPUT_LENGTH = 5 * 1024 * 1024;
  const [input, setInput] = useState("");
  const [decoded, setDecoded] = useState<DecodedJWT | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const decode = useCallback(() => {
    if (!input.trim()) {
      setDecoded(null);
      setError(null);
      return;
    }
    try {
      const result = decodeJWT(input);
      setDecoded(result);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
      setDecoded(null);
    }
  }, [input]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        decode();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [decode]);

  const copySection = async (section: string, data: unknown) => {
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(section);
    setTimeout(() => setCopied(null), 2000);
  };

  const loadSample = () => {
    // Sample JWT (expired, safe to show)
    setInput(
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyNDI2MjIsInJvbGUiOiJhZG1pbiJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">JWT Decoder</h1>
        <p className="text-muted-foreground mt-1">
          Decode and inspect JSON Web Tokens. 100% client-side — your tokens
          never leave your browser.
        </p>
        <div className="flex gap-2 mt-2">
          <Badge variant="secondary">No data sent to server</Badge>
          <Badge variant="outline" className="text-green-500 border-green-500/50">
            Safe for sensitive tokens
          </Badge>
        </div>
      </div>

      {/* Input */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">JWT Token</CardTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={loadSample}>
                Sample
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setInput("");
                  setDecoded(null);
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
            placeholder="Paste your JWT token here (eyJhbGci...)"
            className="font-mono text-sm min-h-[120px] resize-none"
            value={input}
            onChange={(e) => { if (e.target.value.length > MAX_INPUT_LENGTH) { alert("Input too large. Maximum size is 5MB."); return; } setInput(e.target.value); }}
          />
        </CardContent>
      </Card>

      <Button size="lg" onClick={decode}>Decode</Button>
      <span className="text-xs text-muted-foreground ml-2">Ctrl+Enter</span>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-md bg-destructive/10 text-destructive border border-destructive/20 text-sm font-mono">
          Error: {error}
        </div>
      )}

      {/* Result */}
      {decoded && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Header */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-red-400">HEADER</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copySection("header", decoded.header)}
                >
                  {copied === "header" ? "Copied!" : "Copy"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="font-mono text-sm bg-muted p-3 rounded-md overflow-auto">
                {JSON.stringify(decoded.header, null, 2)}
              </pre>
            </CardContent>
          </Card>

          {/* Payload */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-purple-400">
                  PAYLOAD
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copySection("payload", decoded.payload)}
                >
                  {copied === "payload" ? "Copied!" : "Copy"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="font-mono text-sm bg-muted p-3 rounded-md overflow-auto">
                {JSON.stringify(decoded.payload, null, 2)}
              </pre>
            </CardContent>
          </Card>

          {/* Token Info */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Token Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Algorithm: </span>
                  <span className="font-mono">
                    {decoded.header.alg as string}
                  </span>
                </div>
                {decoded.issuedAt && (
                  <div>
                    <span className="text-muted-foreground">Issued At: </span>
                    <span className="font-mono">{decoded.issuedAt}</span>
                  </div>
                )}
                {decoded.expiresAt && (
                  <div>
                    <span className="text-muted-foreground">Expires: </span>
                    <span className="font-mono">{decoded.expiresAt}</span>
                    {decoded.isExpired !== null && (
                      <Badge
                        variant={decoded.isExpired ? "destructive" : "secondary"}
                        className="ml-2 text-xs"
                      >
                        {decoded.isExpired ? "Expired" : "Valid"}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Related Tools */}
      <section className="py-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Base64 Encoder", href: "/tools/base64-encoder" },
            { name: "Hash Generator", href: "/tools/hash-generator" },
            { name: "JSON Formatter", href: "/tools/json-formatter" },
            { name: "Timestamp Converter", href: "/tools/timestamp-converter" },
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
            <TabsTrigger value="what">What is JWT?</TabsTrigger>
            <TabsTrigger value="how">How to Use</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="what" className="mt-4 space-y-3 text-muted-foreground text-sm">
            <h2 className="text-lg font-semibold text-foreground">
              What is a JSON Web Token (JWT)?
            </h2>
            <p>
              A JSON Web Token (JWT) is a compact, URL-safe token format used
              for securely transmitting information between parties. JWTs are
              commonly used for authentication and authorization in web
              applications and APIs.
            </p>
            <h3 className="text-base font-semibold text-foreground">
              JWT Structure
            </h3>
            <p>
              A JWT consists of three parts separated by dots: the Header
              (algorithm and token type), the Payload (claims and data), and
              the Signature (verification). Each part is Base64Url encoded.
            </p>
            <h3 className="text-base font-semibold text-foreground">
              Why Decode JWTs Client-Side?
            </h3>
            <p>
              JWTs often contain sensitive information like user IDs, roles,
              and permissions. Sending them to a third-party server for
              decoding poses a significant security risk. Our decoder processes
              everything in your browser — the token never leaves your device.
            </p>
          </TabsContent>

          <TabsContent value="how" className="mt-4 space-y-3 text-muted-foreground text-sm">
            <h2 className="text-lg font-semibold text-foreground">
              How to Use
            </h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Paste your JWT token in the input field.</li>
              <li>Click &quot;Decode&quot; to inspect the token.</li>
              <li>View the Header, Payload, and token metadata.</li>
              <li>Check if the token is expired.</li>
              <li>Copy individual sections as needed.</li>
            </ol>
          </TabsContent>

          <TabsContent value="faq" className="mt-4 space-y-4 text-muted-foreground text-sm">
            <h2 className="text-lg font-semibold text-foreground">FAQ</h2>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Does this tool verify the JWT signature?
              </h3>
              <p>
                No. This tool only decodes and displays the token contents.
                Signature verification requires the secret key or public key,
                which should never be shared with a web tool.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Is it safe to paste my production JWT here?
              </h3>
              <p>
                Yes. Everything runs in your browser. You can verify by
                checking the Network tab in your browser&apos;s developer
                tools — no requests are made when decoding.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
