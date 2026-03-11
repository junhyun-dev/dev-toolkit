"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MAJOR_KEYWORDS = [
  "SELECT",
  "FROM",
  "WHERE",
  "AND",
  "OR",
  "JOIN",
  "INNER JOIN",
  "LEFT JOIN",
  "RIGHT JOIN",
  "FULL JOIN",
  "FULL OUTER JOIN",
  "LEFT OUTER JOIN",
  "RIGHT OUTER JOIN",
  "CROSS JOIN",
  "ON",
  "GROUP BY",
  "HAVING",
  "ORDER BY",
  "LIMIT",
  "OFFSET",
  "UNION",
  "UNION ALL",
  "INTERSECT",
  "EXCEPT",
  "INSERT INTO",
  "VALUES",
  "UPDATE",
  "SET",
  "DELETE FROM",
  "DELETE",
  "CREATE TABLE",
  "CREATE INDEX",
  "CREATE VIEW",
  "ALTER TABLE",
  "DROP TABLE",
  "DROP INDEX",
  "TRUNCATE TABLE",
  "WITH",
  "AS",
  "CASE",
  "WHEN",
  "THEN",
  "ELSE",
  "END",
  "EXISTS",
  "IN",
  "NOT",
  "BETWEEN",
  "LIKE",
  "IS NULL",
  "IS NOT NULL",
  "ASC",
  "DESC",
  "DISTINCT",
  "INTO",
  "IF",
  "RETURNING",
  "FETCH",
  "FOR",
];

// Keywords that start a new line at indent level 0
const NEWLINE_BEFORE = new Set([
  "SELECT",
  "FROM",
  "WHERE",
  "GROUP BY",
  "HAVING",
  "ORDER BY",
  "LIMIT",
  "OFFSET",
  "UNION",
  "UNION ALL",
  "INTERSECT",
  "EXCEPT",
  "INSERT INTO",
  "VALUES",
  "UPDATE",
  "SET",
  "DELETE FROM",
  "DELETE",
  "CREATE TABLE",
  "CREATE INDEX",
  "CREATE VIEW",
  "ALTER TABLE",
  "DROP TABLE",
  "TRUNCATE TABLE",
  "WITH",
  "RETURNING",
  "FETCH",
]);

// Keywords that start a new line with indent
const NEWLINE_INDENT = new Set([
  "AND",
  "OR",
  "ON",
  "WHEN",
  "THEN",
  "ELSE",
  "END",
]);

// Join keywords - new line, no indent
const JOIN_KEYWORDS = new Set([
  "JOIN",
  "INNER JOIN",
  "LEFT JOIN",
  "RIGHT JOIN",
  "FULL JOIN",
  "FULL OUTER JOIN",
  "LEFT OUTER JOIN",
  "RIGHT OUTER JOIN",
  "CROSS JOIN",
]);

function tokenize(sql: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  const len = sql.length;

  while (i < len) {
    // Skip whitespace
    if (/\s/.test(sql[i])) {
      i++;
      continue;
    }

    // String literal (single quote)
    if (sql[i] === "'") {
      let j = i + 1;
      while (j < len && (sql[j] !== "'" || (j + 1 < len && sql[j + 1] === "'"))) {
        if (sql[j] === "'" && sql[j + 1] === "'") j += 2;
        else j++;
      }
      tokens.push(sql.slice(i, j + 1));
      i = j + 1;
      continue;
    }

    // String literal (double quote / identifier)
    if (sql[i] === '"') {
      let j = i + 1;
      while (j < len && sql[j] !== '"') j++;
      tokens.push(sql.slice(i, j + 1));
      i = j + 1;
      continue;
    }

    // Backtick identifier
    if (sql[i] === "`") {
      let j = i + 1;
      while (j < len && sql[j] !== "`") j++;
      tokens.push(sql.slice(i, j + 1));
      i = j + 1;
      continue;
    }

    // Line comment
    if (sql[i] === "-" && i + 1 < len && sql[i + 1] === "-") {
      let j = i + 2;
      while (j < len && sql[j] !== "\n") j++;
      tokens.push(sql.slice(i, j));
      i = j;
      continue;
    }

    // Block comment
    if (sql[i] === "/" && i + 1 < len && sql[i + 1] === "*") {
      let j = i + 2;
      while (j < len - 1 && !(sql[j] === "*" && sql[j + 1] === "/")) j++;
      tokens.push(sql.slice(i, j + 2));
      i = j + 2;
      continue;
    }

    // Parentheses and special chars
    if ("(),;".includes(sql[i])) {
      tokens.push(sql[i]);
      i++;
      continue;
    }

    // Operators
    if (sql[i] === "<" || sql[i] === ">" || sql[i] === "!" || sql[i] === "=") {
      let j = i + 1;
      if (j < len && (sql[j] === "=" || sql[j] === ">")) j++;
      tokens.push(sql.slice(i, j));
      i = j;
      continue;
    }

    // Dot, asterisk, comma etc
    if (sql[i] === "*" || sql[i] === ".") {
      tokens.push(sql[i]);
      i++;
      continue;
    }

    // Numbers
    if (/\d/.test(sql[i])) {
      let j = i;
      while (j < len && /[\d.]/.test(sql[j])) j++;
      tokens.push(sql.slice(i, j));
      i = j;
      continue;
    }

    // Words
    if (/[a-zA-Z_@#]/.test(sql[i])) {
      let j = i;
      while (j < len && /[a-zA-Z0-9_@#$.]/.test(sql[j])) j++;
      tokens.push(sql.slice(i, j));
      i = j;
      continue;
    }

    // Catch-all
    tokens.push(sql[i]);
    i++;
  }

  return tokens;
}

function formatSQL(sql: string, uppercase: boolean): string {
  if (!sql.trim()) return "";

  const tokens = tokenize(sql);
  const lines: string[] = [];
  let currentLine = "";
  let indentLevel = 0;
  const indent = "  ";
  let parenDepth = 0;

  function pushLine() {
    if (currentLine.trim()) {
      lines.push(indent.repeat(indentLevel) + currentLine.trim());
    }
    currentLine = "";
  }

  function isMultiKeyword(i: number): { keyword: string; consumed: number } | null {
    // Try 3-word keywords first, then 2-word
    const threeWord = [tokens[i], tokens[i + 1], tokens[i + 2]]
      .filter(Boolean)
      .join(" ")
      .toUpperCase();
    for (const kw of MAJOR_KEYWORDS) {
      if (kw.split(" ").length === 3 && threeWord === kw) {
        return { keyword: kw, consumed: 3 };
      }
    }
    const twoWord = [tokens[i], tokens[i + 1]]
      .filter(Boolean)
      .join(" ")
      .toUpperCase();
    for (const kw of MAJOR_KEYWORDS) {
      if (kw.split(" ").length === 2 && twoWord === kw) {
        return { keyword: kw, consumed: 2 };
      }
    }
    return null;
  }

  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i];
    const upperToken = token.toUpperCase();

    // Check multi-word keywords
    const multi = isMultiKeyword(i);
    if (multi) {
      const kw = uppercase ? multi.keyword : multi.keyword;
      const display = uppercase ? kw : kw.toLowerCase();

      if (NEWLINE_BEFORE.has(multi.keyword)) {
        pushLine();
        indentLevel = 0;
        currentLine = display + " ";
      } else if (JOIN_KEYWORDS.has(multi.keyword)) {
        pushLine();
        indentLevel = 0;
        currentLine = display + " ";
      } else if (NEWLINE_INDENT.has(multi.keyword)) {
        pushLine();
        indentLevel = 1;
        currentLine = display + " ";
      } else {
        currentLine += display + " ";
      }
      i += multi.consumed;
      continue;
    }

    // Single keyword check
    if (/^[a-zA-Z_]+$/.test(token)) {
      if (NEWLINE_BEFORE.has(upperToken)) {
        pushLine();
        indentLevel = 0;
        currentLine = (uppercase ? upperToken : token.toLowerCase()) + " ";
        i++;
        continue;
      }
      if (JOIN_KEYWORDS.has(upperToken)) {
        pushLine();
        indentLevel = 0;
        currentLine = (uppercase ? upperToken : token.toLowerCase()) + " ";
        i++;
        continue;
      }
      if (NEWLINE_INDENT.has(upperToken)) {
        pushLine();
        indentLevel = 1;
        currentLine = (uppercase ? upperToken : token.toLowerCase()) + " ";
        i++;
        continue;
      }

      // Regular keyword or identifier
      const isKeyword = MAJOR_KEYWORDS.includes(upperToken);
      currentLine += (isKeyword && uppercase ? upperToken : token) + " ";
      i++;
      continue;
    }

    // Parentheses
    if (token === "(") {
      currentLine += "(";
      parenDepth++;
      i++;
      continue;
    }
    if (token === ")") {
      currentLine += ")";
      parenDepth--;
      i++;
      continue;
    }

    // Semicolons
    if (token === ";") {
      currentLine += ";";
      pushLine();
      lines.push(""); // blank line between statements
      indentLevel = 0;
      i++;
      continue;
    }

    // Commas - new line within SELECT
    if (token === ",") {
      currentLine += ",";
      // Only split on commas if we're at top level (not inside parens)
      if (parenDepth === 0) {
        pushLine();
        indentLevel = 1;
      }
      i++;
      continue;
    }

    // Comments
    if (token.startsWith("--") || token.startsWith("/*")) {
      pushLine();
      lines.push(indent.repeat(indentLevel) + token);
      i++;
      continue;
    }

    // Everything else
    currentLine += token + " ";
    i++;
  }

  pushLine();

  // Clean up trailing blank lines
  while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
    lines.pop();
  }

  return lines.join("\n");
}

function minifySQL(sql: string, uppercase: boolean): string {
  const tokens = tokenize(sql);
  const parts: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const isKw = MAJOR_KEYWORDS.includes(token.toUpperCase());

    if (token.startsWith("--")) continue; // strip line comments
    if (token.startsWith("/*")) continue; // strip block comments

    if (isKw && uppercase) {
      parts.push(token.toUpperCase());
    } else {
      parts.push(token);
    }
  }

  // Join with appropriate spacing
  let result = "";
  for (let i = 0; i < parts.length; i++) {
    const prev = i > 0 ? parts[i - 1] : "";
    const curr = parts[i];

    // No space before comma, semicolon, closing paren
    if (",);".includes(curr)) {
      result += curr;
      continue;
    }
    // No space after opening paren
    if (prev === "(") {
      result += curr;
      continue;
    }
    // No space around dot
    if (curr === "." || prev === ".") {
      result += curr;
      continue;
    }
    // No space before dot
    if (i > 0 && curr !== "(" && prev !== "") {
      result += " ";
    }
    result += curr;
  }

  return result.trim();
}

const sampleSQL = `SELECT u.id, u.name, u.email, COUNT(o.id) AS order_count, SUM(o.total) AS total_spent
FROM users u
INNER JOIN orders o ON u.id = o.user_id
LEFT JOIN addresses a ON u.id = a.user_id AND a.is_primary = 1
WHERE u.created_at >= '2024-01-01'
AND u.status = 'active'
AND o.total > 50
GROUP BY u.id, u.name, u.email
HAVING COUNT(o.id) > 3
ORDER BY total_spent DESC
LIMIT 100;

INSERT INTO audit_log (user_id, action, created_at)
VALUES (1, 'login', NOW());

UPDATE users SET last_login = NOW(), login_count = login_count + 1 WHERE id = 42;`;

export default function SqlFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [uppercaseKeywords, setUppercaseKeywords] = useState(true);

  const format = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }
    try {
      setOutput(formatSQL(input, uppercaseKeywords));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  }, [input, uppercaseKeywords]);

  const minify = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }
    try {
      setOutput(minifySQL(input, uppercaseKeywords));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  }, [input, uppercaseKeywords]);

  const copyToClipboard = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">SQL Formatter & Beautifier</h1>
        <p className="text-muted-foreground mt-1">
          Format, beautify, or minify SQL queries with proper indentation. 100%
          client-side processing.
        </p>
        <Badge variant="secondary" className="mt-2">
          No data sent to server
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">SQL Input</CardTitle>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setInput(sampleSQL);
                    setOutput("");
                    setError(null);
                  }}
                >
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
              placeholder="Paste your SQL query here..."
              className="font-mono text-sm min-h-[300px] resize-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Formatted Output</CardTitle>
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
                placeholder="Formatted SQL will appear here..."
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button size="lg" onClick={format}>
          Format SQL
        </Button>
        <Button size="lg" variant="secondary" onClick={minify}>
          Minify SQL
        </Button>
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={uppercaseKeywords}
            onChange={(e) => setUppercaseKeywords(e.target.checked)}
            className="w-4 h-4 rounded border-border"
          />
          Uppercase keywords
        </label>
      </div>

      <section className="space-y-4 py-8 border-t">
        <Tabs defaultValue="what">
          <TabsList>
            <TabsTrigger value="what">What is SQL Formatting?</TabsTrigger>
            <TabsTrigger value="how">How to Use</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent
            value="what"
            className="mt-4 space-y-3 text-muted-foreground text-sm"
          >
            <h2 className="text-lg font-semibold text-foreground">
              Why Format SQL Queries?
            </h2>
            <p>
              Well-formatted SQL queries are easier to read, debug, and maintain.
              Proper indentation and keyword placement help developers quickly
              understand query structure, identify joins, filter conditions, and
              aggregations. This is especially important in code reviews, team
              collaboration, and documentation.
            </p>
            <h3 className="text-base font-semibold text-foreground">
              Supported SQL Features
            </h3>
            <p>
              This formatter handles SELECT, FROM, WHERE, JOIN (all types),
              GROUP BY, ORDER BY, HAVING, INSERT, UPDATE, DELETE, CREATE TABLE,
              ALTER TABLE, subqueries, comments, string literals, and most
              standard SQL syntax. It works with MySQL, PostgreSQL, SQLite, SQL
              Server, and other SQL dialects.
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
              <li>Paste your SQL query in the input field.</li>
              <li>
                Click Format SQL for beautified output or Minify SQL for a
                single-line version.
              </li>
              <li>
                Toggle Uppercase keywords to control keyword casing.
              </li>
              <li>Copy the result to your clipboard.</li>
            </ol>
          </TabsContent>

          <TabsContent
            value="faq"
            className="mt-4 space-y-4 text-muted-foreground text-sm"
          >
            <h2 className="text-lg font-semibold text-foreground">FAQ</h2>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Which SQL dialects are supported?
              </h3>
              <p>
                The formatter works with standard SQL syntax that is common
                across MySQL, PostgreSQL, SQLite, SQL Server, and Oracle. It
                focuses on formatting structure rather than dialect-specific
                validation, so it works well with most SQL variants.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Does it validate my SQL?
              </h3>
              <p>
                No, this tool formats the structure of your SQL without
                validating syntax or logic. It preserves your query as-is and
                only adjusts whitespace and indentation. Always test your queries
                against your actual database.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
