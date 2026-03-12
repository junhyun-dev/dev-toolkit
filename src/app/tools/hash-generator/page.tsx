"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HashResult {
  md5: string;
  "sha-1": string;
  "sha-256": string;
  "sha-512": string;
}

async function generateHash(
  text: string,
  algorithm: string
): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Simple MD5 implementation (Web Crypto API doesn't support MD5)
function md5(string: string): string {
  function rotateLeft(value: number, shift: number) {
    return (value << shift) | (value >>> (32 - shift));
  }

  const utf8 = unescape(encodeURIComponent(string));
  const bytes: number[] = [];
  for (let i = 0; i < utf8.length; i++) {
    bytes.push(utf8.charCodeAt(i));
  }

  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);

  const bitLen = utf8.length * 8;
  bytes.push(bitLen & 0xff, (bitLen >> 8) & 0xff, (bitLen >> 16) & 0xff, (bitLen >> 24) & 0xff);
  bytes.push(0, 0, 0, 0);

  const S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];

  const K = Array.from({ length: 64 }, (_, i) =>
    Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000)
  );

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  for (let i = 0; i < bytes.length; i += 64) {
    const M: number[] = [];
    for (let j = 0; j < 16; j++) {
      M[j] =
        bytes[i + j * 4] |
        (bytes[i + j * 4 + 1] << 8) |
        (bytes[i + j * 4 + 2] << 16) |
        (bytes[i + j * 4 + 3] << 24);
    }

    let A = a0, B = b0, C = c0, D = d0;

    for (let j = 0; j < 64; j++) {
      let F: number, g: number;
      if (j < 16) {
        F = (B & C) | (~B & D);
        g = j;
      } else if (j < 32) {
        F = (D & B) | (~D & C);
        g = (5 * j + 1) % 16;
      } else if (j < 48) {
        F = B ^ C ^ D;
        g = (3 * j + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * j) % 16;
      }

      F = (F + A + K[j] + M[g]) >>> 0;
      A = D;
      D = C;
      C = B;
      B = (B + rotateLeft(F, S[j])) >>> 0;
    }

    a0 = (a0 + A) >>> 0;
    b0 = (b0 + B) >>> 0;
    c0 = (c0 + C) >>> 0;
    d0 = (d0 + D) >>> 0;
  }

  const toHex = (n: number) =>
    [n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, (n >> 24) & 0xff]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

  return toHex(a0) + toHex(b0) + toHex(c0) + toHex(d0);
}

export default function HashGeneratorPage() {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<HashResult | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const generate = useCallback(async () => {
    if (!input.trim()) {
      setHashes(null);
      return;
    }
    const [sha1, sha256, sha512] = await Promise.all([
      generateHash(input, "SHA-1"),
      generateHash(input, "SHA-256"),
      generateHash(input, "SHA-512"),
    ]);
    setHashes({
      md5: md5(input),
      "sha-1": sha1,
      "sha-256": sha256,
      "sha-512": sha512,
    });
  }, [input]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        generate();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [generate]);

  const copyHash = async (name: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(name);
    setTimeout(() => setCopied(null), 2000);
  };

  const loadSample = () => {
    setInput("Hello, World!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Hash Generator</h1>
        <p className="text-muted-foreground mt-1">
          Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from any text. Uses
          the Web Crypto API — 100% client-side.
        </p>
        <Badge variant="secondary" className="mt-2">
          No data sent to server
        </Badge>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Input Text</CardTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={loadSample}>
                Sample
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setInput("");
                  setHashes(null);
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter text to hash..."
            className="font-mono text-sm min-h-[150px] resize-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </CardContent>
      </Card>

      <Button size="lg" onClick={generate}>
        Generate Hashes
      </Button>
      <span className="text-xs text-muted-foreground ml-2">Ctrl+Enter</span>

      {hashes && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Hash Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(
              Object.entries(hashes) as [keyof HashResult, string][]
            ).map(([name, value]) => (
              <div key={name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    {name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyHash(name, value)}
                  >
                    {copied === name ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <div className="font-mono text-sm bg-muted px-3 py-2 rounded-md break-all">
                  {value}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Related Tools */}
      <section className="py-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Base64 Encoder", href: "/tools/base64-encoder" },
            { name: "UUID Generator", href: "/tools/uuid-generator" },
            { name: "JWT Decoder", href: "/tools/jwt-decoder" },
            { name: "URL Encoder", href: "/tools/url-encoder" },
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
            <TabsTrigger value="what">What is Hashing?</TabsTrigger>
            <TabsTrigger value="how">How to Use</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent
            value="what"
            className="mt-4 space-y-3 text-muted-foreground text-sm"
          >
            <h2 className="text-lg font-semibold text-foreground">
              What is a Hash Function?
            </h2>
            <p>
              A hash function takes an input of any size and produces a
              fixed-size string of characters, called a hash or digest. The
              same input always produces the same hash, but even a tiny change
              in the input produces a completely different hash. Hash functions
              are one-way — you cannot reverse a hash back to the original
              input.
            </p>
            <h3 className="text-base font-semibold text-foreground">
              Hash Algorithm Comparison
            </h3>
            <p>
              MD5 produces a 128-bit (32 character) hash and is fast but
              considered cryptographically broken. SHA-1 produces a 160-bit
              (40 character) hash and is also deprecated for security use.
              SHA-256 (part of SHA-2 family) produces a 256-bit (64 character)
              hash and is widely used for data integrity verification and
              blockchain. SHA-512 produces a 512-bit (128 character) hash and
              offers the highest security among these algorithms.
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
              <li>Enter or paste your text in the input field.</li>
              <li>Click &quot;Generate Hashes&quot; to compute all hash types.</li>
              <li>Copy individual hash values as needed.</li>
            </ol>
          </TabsContent>

          <TabsContent
            value="faq"
            className="mt-4 space-y-4 text-muted-foreground text-sm"
          >
            <h2 className="text-lg font-semibold text-foreground">FAQ</h2>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Which hash algorithm should I use?
              </h3>
              <p>
                For security purposes, use SHA-256 or SHA-512. MD5 and SHA-1
                are suitable only for non-security uses like checksums or data
                deduplication.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Can I decrypt a hash?
              </h3>
              <p>
                No. Hash functions are designed to be one-way. You cannot
                reverse a hash to get the original input. This is what makes
                them useful for password storage and data integrity.
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
