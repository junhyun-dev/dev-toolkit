"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

const categories = [
  {
    label: "Formatters",
    tools: [
      { name: "JSON Formatter", href: "/tools/json-formatter" },
      { name: "SQL Formatter", href: "/tools/sql-formatter" },
      { name: "CSS Minifier", href: "/tools/css-minifier" },
      { name: "Markdown Preview", href: "/tools/markdown-preview" },
    ],
  },
  {
    label: "Converters",
    tools: [
      { name: "Base64 Encoder", href: "/tools/base64-encoder" },
      { name: "URL Encoder", href: "/tools/url-encoder" },
      { name: "HTML Entity Encoder", href: "/tools/html-entity-encoder" },
      { name: "JSON to YAML", href: "/tools/json-to-yaml" },
      { name: "Tailwind Converter", href: "/tools/tailwind-converter" },
      { name: "Color Converter", href: "/tools/color-converter" },
      { name: "Timestamp Converter", href: "/tools/timestamp-converter" },
    ],
  },
  {
    label: "Generators",
    tools: [
      { name: "UUID Generator", href: "/tools/uuid-generator" },
      { name: "Hash Generator", href: "/tools/hash-generator" },
      { name: "Lorem Ipsum", href: "/tools/lorem-ipsum" },
      { name: "Cron Generator", href: "/tools/cron-generator" },
      { name: "CSS Gradient", href: "/tools/css-gradient-generator" },
      { name: "Meta Tag Generator", href: "/tools/meta-tag-generator" },
    ],
  },
  {
    label: "Validators & Tools",
    tools: [
      { name: "Diff Checker", href: "/tools/diff-checker" },
      { name: "JWT Decoder", href: "/tools/jwt-decoder" },
      { name: "Regex Tester", href: "/tools/regex-tester" },
      { name: "YAML Validator", href: "/tools/yaml-validator" },
      { name: "Chmod Calculator", href: "/tools/chmod-calculator" },
      { name: "JSON Path Finder", href: "/tools/json-path-finder" },
      { name: "SVG Optimizer", href: "/tools/svg-optimizer" },
      { name: "OG Preview", href: "/tools/og-preview" },
    ],
  },
];

export default function NavDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
      >
        Tools
        <svg
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[600px] bg-card border border-border rounded-lg shadow-xl p-4 z-50 columns-2 gap-4">
          {categories.map((cat) => (
            <div key={cat.label} className="break-inside-avoid mb-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {cat.label}
              </h3>
              <ul className="space-y-1">
                {cat.tools.map((tool) => (
                  <li key={tool.href}>
                    <Link
                      href={tool.href}
                      onClick={() => setOpen(false)}
                      className="block text-sm text-foreground/80 hover:text-primary hover:bg-primary/5 rounded px-2 py-1 transition-colors"
                    >
                      {tool.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
