"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
  "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
  "deserunt", "mollit", "anim", "id", "est", "laborum", "perspiciatis", "unde",
  "omnis", "iste", "natus", "error", "voluptatem", "accusantium", "doloremque",
  "laudantium", "totam", "rem", "aperiam", "eaque", "ipsa", "quae", "ab",
  "inventore", "veritatis", "quasi", "architecto", "beatae", "vitae", "dicta",
  "explicabo", "nemo", "ipsam", "quia", "voluptas", "aspernatur", "odit", "aut",
  "fugit", "consequuntur", "magni", "dolores", "eos", "ratione", "sequi",
  "nesciunt", "neque", "porro", "quisquam", "dolorem", "adipisci", "numquam",
  "eius", "modi", "tempora", "incidunt", "magnam", "quaerat",
];

const CLASSIC_START =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

function randomWord(): string {
  return LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
}

function generateSentence(wordCount = 8): string {
  const count = wordCount + Math.floor(Math.random() * 6) - 3;
  const words = Array.from({ length: Math.max(5, count) }, () => randomWord());
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(" ") + ".";
}

function generateParagraph(sentenceCount = 5): string {
  return Array.from({ length: sentenceCount }, () => generateSentence()).join(" ");
}

type Mode = "paragraphs" | "sentences" | "words";

export default function LoremIpsumPage() {
  const [mode, setMode] = useState<Mode>("paragraphs");
  const [count, setCount] = useState(3);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    let result = "";
    if (mode === "paragraphs") {
      const paragraphs = Array.from({ length: count }, (_, i) => {
        if (i === 0 && startWithLorem) {
          return CLASSIC_START + " " + generateParagraph(4);
        }
        return generateParagraph(5);
      });
      result = paragraphs.join("\n\n");
    } else if (mode === "sentences") {
      const sentences = Array.from({ length: count }, (_, i) => {
        if (i === 0 && startWithLorem) return CLASSIC_START;
        return generateSentence();
      });
      result = sentences.join(" ");
    } else {
      const words = Array.from({ length: count }, (_, i) => {
        if (i === 0 && startWithLorem) return "Lorem";
        return randomWord();
      });
      result = words.join(" ");
    }
    setOutput(result);
  }, [mode, count, startWithLorem]);

  const copyToClipboard = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const countOptions: Record<Mode, number[]> = {
    paragraphs: [1, 2, 3, 5, 10],
    sentences: [1, 3, 5, 10, 20],
    words: [10, 25, 50, 100, 200],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Lorem Ipsum Generator</h1>
        <p className="text-muted-foreground mt-1">
          Generate placeholder text for your designs and layouts. Instantly.
        </p>
        <Badge variant="secondary" className="mt-2">
          No data sent to server
        </Badge>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mode */}
          <div className="flex flex-wrap gap-2">
            {(["paragraphs", "sentences", "words"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setCount(countOptions[m][2]);
                }}
                className={`px-4 py-2 rounded-md text-sm capitalize transition-colors ${
                  mode === m
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Count */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">
              How many {mode}?
            </p>
            <div className="flex flex-wrap gap-2">
              {countOptions[mode].map((n) => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`px-4 py-2 rounded-md text-sm transition-colors ${
                    count === n
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Start with Lorem */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={startWithLorem}
              onChange={(e) => setStartWithLorem(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Start with &quot;Lorem ipsum dolor sit amet...&quot;</span>
          </label>

          <Button size="lg" onClick={generate}>
            Generate
          </Button>
        </CardContent>
      </Card>

      {/* Output */}
      {output && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">
                Generated Text
                <span className="ml-2 font-normal text-muted-foreground">
                  ({output.split(/\s+/).filter(Boolean).length} words)
                </span>
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap font-mono text-sm p-3 bg-muted rounded-md border border-border leading-relaxed">
              {output}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Related Tools */}
      <section className="py-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "HTML Entity Encoder", href: "/tools/html-entity-encoder" },
            { name: "Markdown Preview", href: "/tools/markdown-preview" },
            { name: "UUID Generator", href: "/tools/uuid-generator" },
            { name: "JSON Formatter", href: "/tools/json-formatter" },
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
            <TabsTrigger value="what">What is Lorem Ipsum?</TabsTrigger>
            <TabsTrigger value="how">How to Use</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="what" className="prose prose-invert max-w-none mt-4 space-y-3 text-muted-foreground text-sm">
            <h2 className="text-lg font-semibold text-foreground">What is Lorem Ipsum?</h2>
            <p>
              Lorem Ipsum is a standard placeholder text used in the printing and
              typesetting industry since the 1500s. It is derived from a work by
              Cicero, &quot;de Finibus Bonorum et Malorum&quot;, and has been the
              industry&apos;s standard dummy text ever since.
            </p>
            <h3 className="text-base font-semibold text-foreground">Why Use Placeholder Text?</h3>
            <p>
              Designers use Lorem Ipsum to fill layouts so the focus stays on the
              visual design rather than the content. Using readable text like
              &quot;insert content here&quot; can distract reviewers from evaluating
              the design itself.
            </p>
          </TabsContent>

          <TabsContent value="how" className="prose prose-invert max-w-none mt-4 space-y-3 text-muted-foreground text-sm">
            <h2 className="text-lg font-semibold text-foreground">How to Use This Tool</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Select a mode: Paragraphs, Sentences, or Words.</li>
              <li>Choose how many you need.</li>
              <li>Toggle whether to start with the classic Lorem Ipsum opening.</li>
              <li>Click &quot;Generate&quot; to create the text.</li>
              <li>Click &quot;Copy&quot; to copy it to your clipboard.</li>
            </ol>
          </TabsContent>

          <TabsContent value="faq" className="prose prose-invert max-w-none mt-4 space-y-4 text-muted-foreground text-sm">
            <h2 className="text-lg font-semibold text-foreground">Frequently Asked Questions</h2>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Is Lorem Ipsum real Latin?</h3>
              <p>
                It is scrambled Latin from Cicero&apos;s philosophical text. The words
                are recognizable but intentionally randomized so they don&apos;t form
                readable sentences.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Can I use this for commercial projects?</h3>
              <p>
                Yes. Lorem Ipsum text is in the public domain and can be used freely
                in any personal or commercial project.
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
