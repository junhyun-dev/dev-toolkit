"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- Built-in Markdown to HTML parser (no external libraries) ---

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseInline(text: string): string {
  let result = text;

  // Images (before links) ![alt](url)
  result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;" />');

  // Links [text](url)
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">$1</a>');

  // Bold+Italic ***text*** or ___text___
  result = result.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  result = result.replace(/___(.+?)___/g, "<strong><em>$1</em></strong>");

  // Bold **text** or __text__
  result = result.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  result = result.replace(/__(.+?)__/g, "<strong>$1</strong>");

  // Italic *text* or _text_
  result = result.replace(/\*(.+?)\*/g, "<em>$1</em>");
  result = result.replace(/(?<!\w)_(.+?)_(?!\w)/g, "<em>$1</em>");

  // Strikethrough ~~text~~
  result = result.replace(/~~(.+?)~~/g, "<del>$1</del>");

  // Inline code `code`
  result = result.replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');

  return result;
}

function markdownToHtml(md: string): string {
  const lines = md.split("\n");
  const html: string[] = [];
  let i = 0;
  let inList: "ul" | "ol" | null = null;

  const closeList = () => {
    if (inList) {
      html.push(inList === "ul" ? "</ul>" : "</ol>");
      inList = null;
    }
  };

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block ```
    if (line.trim().startsWith("```")) {
      closeList();
      const lang = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(escapeHtml(lines[i]));
        i++;
      }
      i++; // skip closing ```
      html.push(
        `<pre class="bg-gray-100 dark:bg-gray-800 rounded-md p-4 overflow-x-auto my-3"><code${lang ? ` class="language-${lang}"` : ""}>${codeLines.join("\n")}</code></pre>`
      );
      continue;
    }

    // Horizontal rule --- or *** or ___
    if (/^(\*{3,}|-{3,}|_{3,})\s*$/.test(line.trim())) {
      closeList();
      html.push('<hr class="my-4 border-t" />');
      i++;
      continue;
    }

    // Headings # to ######
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      closeList();
      const level = headingMatch[1].length;
      const sizes: Record<number, string> = {
        1: "text-3xl font-bold mt-6 mb-3",
        2: "text-2xl font-bold mt-5 mb-2",
        3: "text-xl font-semibold mt-4 mb-2",
        4: "text-lg font-semibold mt-3 mb-1",
        5: "text-base font-semibold mt-2 mb-1",
        6: "text-sm font-semibold mt-2 mb-1",
      };
      html.push(
        `<h${level} class="${sizes[level]}">${parseInline(headingMatch[2])}</h${level}>`
      );
      i++;
      continue;
    }

    // Blockquote >
    if (line.trim().startsWith("> ") || line.trim() === ">") {
      closeList();
      const quoteLines: string[] = [];
      while (i < lines.length && (lines[i].trim().startsWith("> ") || lines[i].trim() === ">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      html.push(
        `<blockquote class="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-3 text-muted-foreground italic">${quoteLines.map((l) => parseInline(l)).join("<br />")}</blockquote>`
      );
      continue;
    }

    // Table
    if (line.includes("|") && i + 1 < lines.length && /^\s*\|?\s*[-:]+/.test(lines[i + 1])) {
      closeList();
      const headerCells = line
        .split("|")
        .map((c) => c.trim())
        .filter(Boolean);
      i += 2; // skip header and separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|")) {
        const cells = lines[i]
          .split("|")
          .map((c) => c.trim())
          .filter(Boolean);
        rows.push(cells);
        i++;
      }
      const thead = `<thead><tr>${headerCells.map((c) => `<th class="border px-3 py-1.5 bg-muted/50 font-semibold text-left">${parseInline(c)}</th>`).join("")}</tr></thead>`;
      const tbody = rows
        .map(
          (row) =>
            `<tr>${row.map((c) => `<td class="border px-3 py-1.5">${parseInline(c)}</td>`).join("")}</tr>`
        )
        .join("");
      html.push(
        `<table class="border-collapse border my-3 w-full text-sm">${thead}<tbody>${tbody}</tbody></table>`
      );
      continue;
    }

    // Unordered list - or * or +
    if (/^\s*[-*+]\s+/.test(line)) {
      if (inList !== "ul") {
        closeList();
        inList = "ul";
        html.push('<ul class="list-disc list-inside my-2 space-y-1">');
      }
      html.push(`<li>${parseInline(line.replace(/^\s*[-*+]\s+/, ""))}</li>`);
      i++;
      continue;
    }

    // Ordered list 1. or 1)
    if (/^\s*\d+[.)]\s+/.test(line)) {
      if (inList !== "ol") {
        closeList();
        inList = "ol";
        html.push('<ol class="list-decimal list-inside my-2 space-y-1">');
      }
      html.push(`<li>${parseInline(line.replace(/^\s*\d+[.)]\s+/, ""))}</li>`);
      i++;
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      closeList();
      i++;
      continue;
    }

    // Paragraph
    closeList();
    const paraLines: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].trim().startsWith("#") &&
      !lines[i].trim().startsWith("```") &&
      !lines[i].trim().startsWith("> ") &&
      !/^\s*[-*+]\s+/.test(lines[i]) &&
      !/^\s*\d+[.)]\s+/.test(lines[i]) &&
      !/^(\*{3,}|-{3,}|_{3,})\s*$/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    html.push(`<p class="my-2 leading-relaxed">${paraLines.map((l) => parseInline(l)).join(" ")}</p>`);
  }

  closeList();
  return html.join("\n");
}

function sanitizeHtml(html: string): string {
  // Remove script tags
  let clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  // Remove event handlers
  clean = clean.replace(/\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi, "");
  // Remove javascript: URLs
  clean = clean.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');
  return clean;
}

// ---

const SAMPLE_MARKDOWN = `# Markdown Preview Demo

## Text Formatting

This is a paragraph with **bold text**, *italic text*, and ***bold italic***. You can also use ~~strikethrough~~ and \`inline code\`.

## Links and Images

Visit [OpenAI](https://openai.com) for more info.

![Placeholder](https://via.placeholder.com/400x200)

## Lists

### Unordered List
- First item
- Second item
- Third item

### Ordered List
1. Step one
2. Step two
3. Step three

## Code Block

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet("World");
\`\`\`

## Blockquote

> The best way to predict the future is to invent it.
> — Alan Kay

## Table

| Feature | Status | Priority |
|---------|--------|----------|
| Headers | Done | High |
| Bold/Italic | Done | High |
| Code Blocks | Done | Medium |
| Tables | Done | Medium |

---

*Built with a custom Markdown parser — no external libraries!*`;

export default function MarkdownPreviewPage() {
  const [markdown, setMarkdown] = useState("");
  const [copiedHtml, setCopiedHtml] = useState(false);

  const htmlOutput = useMemo(() => {
    if (!markdown.trim()) return "";
    return sanitizeHtml(markdownToHtml(markdown));
  }, [markdown]);

  const copyHtml = useCallback(async () => {
    if (!htmlOutput) return;
    await navigator.clipboard.writeText(htmlOutput);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  }, [htmlOutput]);

  const loadSample = () => {
    setMarkdown(SAMPLE_MARKDOWN);
  };

  const clear = () => {
    setMarkdown("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Markdown Preview</h1>
        <p className="text-muted-foreground mt-1">
          Write Markdown and see a live preview with HTML output. Supports
          headers, bold, italic, links, code blocks, tables, and more. 100%
          client-side processing.
        </p>
        <Badge variant="secondary" className="mt-2">
          No data sent to server
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="lg" variant="secondary" onClick={loadSample}>
          Sample
        </Button>
        <Button size="lg" variant="secondary" onClick={clear}>
          Clear
        </Button>
        <Button
          size="lg"
          variant="secondary"
          onClick={copyHtml}
          disabled={!htmlOutput}
        >
          {copiedHtml ? "Copied!" : "Copy HTML"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Markdown Editor</CardTitle>
              <Badge variant="outline" className="text-xs">
                {markdown.length} chars
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Type your Markdown here..."
              className="font-mono text-sm min-h-[500px] resize-none"
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Live Preview</CardTitle>
              <Badge variant="outline" className="text-xs">
                Preview
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {htmlOutput ? (
              <div
                className="prose prose-sm dark:prose-invert max-w-none min-h-[500px] p-3 rounded-md border bg-background overflow-auto"
                dangerouslySetInnerHTML={{ __html: htmlOutput }}
              />
            ) : (
              <div className="min-h-[500px] p-3 rounded-md border bg-muted/30 text-muted-foreground text-sm flex items-center justify-center">
                Preview will appear here as you type...
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">HTML Output</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyHtml}
              disabled={!htmlOutput}
            >
              {copiedHtml ? "Copied!" : "Copy"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            className="font-mono text-sm min-h-[200px] resize-none"
            value={htmlOutput}
            readOnly
            placeholder="HTML output will appear here..."
          />
        </CardContent>
      </Card>

      {/* Related Tools */}
      <section className="py-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "JSON Formatter", href: "/tools/json-formatter" },
            { name: "Diff Checker", href: "/tools/diff-checker" },
            { name: "JSON to YAML", href: "/tools/json-to-yaml" },
            { name: "Tailwind Converter", href: "/tools/tailwind-converter" },
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
            <TabsTrigger value="what">What is Markdown?</TabsTrigger>
            <TabsTrigger value="how">How to Use</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent
            value="what"
            className="mt-4 space-y-3 text-muted-foreground text-sm"
          >
            <h2 className="text-lg font-semibold text-foreground">
              What is Markdown?
            </h2>
            <p>
              Markdown is a lightweight markup language created by John Gruber in
              2004. It allows you to write formatted text using a plain-text
              editor with a simple, readable syntax. Markdown files use the .md
              extension and are widely used for documentation, README files, blog
              posts, and note-taking.
            </p>
            <h3 className="text-base font-semibold text-foreground">
              Where is Markdown Used?
            </h3>
            <p>
              Markdown is used on GitHub (README files, issues, pull requests),
              Stack Overflow, Reddit, Discord, Notion, Obsidian, Jekyll, Hugo,
              and many other platforms. Most modern documentation systems support
              Markdown as their primary authoring format.
            </p>
          </TabsContent>

          <TabsContent
            value="how"
            className="mt-4 space-y-3 text-muted-foreground text-sm"
          >
            <h2 className="text-lg font-semibold text-foreground">How to Use</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Type or paste Markdown in the left editor panel.</li>
              <li>See the live preview update in real-time on the right.</li>
              <li>View the raw HTML output in the section below.</li>
              <li>Click &quot;Copy HTML&quot; to copy the generated HTML to your clipboard.</li>
              <li>Use the Sample button to load example Markdown content.</li>
            </ol>
          </TabsContent>

          <TabsContent
            value="faq"
            className="mt-4 space-y-4 text-muted-foreground text-sm"
          >
            <h2 className="text-lg font-semibold text-foreground">FAQ</h2>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Does this support all Markdown features?
              </h3>
              <p>
                This tool supports the most common Markdown features: headings,
                bold, italic, strikethrough, links, images, code blocks (fenced),
                inline code, blockquotes, ordered and unordered lists, tables,
                and horizontal rules. Some advanced features like footnotes and
                task lists are not yet supported.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Is the HTML output safe?
              </h3>
              <p>
                Yes. The generated HTML is sanitized to remove script tags, event
                handlers, and javascript: URLs before rendering. However, for
                production use, consider using a dedicated sanitization library
                like DOMPurify.
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
