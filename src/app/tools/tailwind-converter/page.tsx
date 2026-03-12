"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const cssToTailwind: Record<string, Record<string, string>> = {
  display: {
    block: "block",
    "inline-block": "inline-block",
    inline: "inline",
    flex: "flex",
    "inline-flex": "inline-flex",
    grid: "grid",
    "inline-grid": "inline-grid",
    none: "hidden",
    table: "table",
  },
  position: {
    static: "static",
    fixed: "fixed",
    absolute: "absolute",
    relative: "relative",
    sticky: "sticky",
  },
  "flex-direction": {
    row: "flex-row",
    "row-reverse": "flex-row-reverse",
    column: "flex-col",
    "column-reverse": "flex-col-reverse",
  },
  "flex-wrap": {
    wrap: "flex-wrap",
    "wrap-reverse": "flex-wrap-reverse",
    nowrap: "flex-nowrap",
  },
  "justify-content": {
    "flex-start": "justify-start",
    "flex-end": "justify-end",
    center: "justify-center",
    "space-between": "justify-between",
    "space-around": "justify-around",
    "space-evenly": "justify-evenly",
  },
  "align-items": {
    "flex-start": "items-start",
    "flex-end": "items-end",
    center: "items-center",
    baseline: "items-baseline",
    stretch: "items-stretch",
  },
  "text-align": {
    left: "text-left",
    center: "text-center",
    right: "text-right",
    justify: "text-justify",
  },
  "font-weight": {
    "100": "font-thin",
    "200": "font-extralight",
    "300": "font-light",
    "400": "font-normal",
    normal: "font-normal",
    "500": "font-medium",
    "600": "font-semibold",
    "700": "font-bold",
    bold: "font-bold",
    "800": "font-extrabold",
    "900": "font-black",
  },
  "font-style": {
    italic: "italic",
    normal: "not-italic",
  },
  "text-decoration": {
    underline: "underline",
    "line-through": "line-through",
    none: "no-underline",
    overline: "overline",
  },
  "text-transform": {
    uppercase: "uppercase",
    lowercase: "lowercase",
    capitalize: "capitalize",
    none: "normal-case",
  },
  overflow: {
    auto: "overflow-auto",
    hidden: "overflow-hidden",
    visible: "overflow-visible",
    scroll: "overflow-scroll",
  },
  "overflow-x": {
    auto: "overflow-x-auto",
    hidden: "overflow-x-hidden",
    visible: "overflow-x-visible",
    scroll: "overflow-x-scroll",
  },
  "overflow-y": {
    auto: "overflow-y-auto",
    hidden: "overflow-y-hidden",
    visible: "overflow-y-visible",
    scroll: "overflow-y-scroll",
  },
  cursor: {
    pointer: "cursor-pointer",
    default: "cursor-default",
    "not-allowed": "cursor-not-allowed",
    wait: "cursor-wait",
    text: "cursor-text",
    move: "cursor-move",
    grab: "cursor-grab",
  },
  visibility: {
    visible: "visible",
    hidden: "invisible",
  },
  "white-space": {
    nowrap: "whitespace-nowrap",
    normal: "whitespace-normal",
    pre: "whitespace-pre",
    "pre-line": "whitespace-pre-line",
    "pre-wrap": "whitespace-pre-wrap",
  },
  "word-break": {
    "break-all": "break-all",
    "break-word": "break-words",
  },
  "box-sizing": {
    "border-box": "box-border",
    "content-box": "box-content",
  },
  "object-fit": {
    contain: "object-contain",
    cover: "object-cover",
    fill: "object-fill",
    none: "object-none",
    "scale-down": "object-scale-down",
  },
  "pointer-events": {
    none: "pointer-events-none",
    auto: "pointer-events-auto",
  },
  resize: {
    none: "resize-none",
    both: "resize",
    vertical: "resize-y",
    horizontal: "resize-x",
  },
  "list-style-type": {
    none: "list-none",
    disc: "list-disc",
    decimal: "list-decimal",
  },
  "border-style": {
    solid: "border-solid",
    dashed: "border-dashed",
    dotted: "border-dotted",
    double: "border-double",
    none: "border-none",
  },
};

const spacingMap: Record<string, string> = {
  "0": "0",
  "0px": "0",
  "1px": "px",
  "0.125rem": "0.5",
  "2px": "0.5",
  "0.25rem": "1",
  "4px": "1",
  "0.375rem": "1.5",
  "6px": "1.5",
  "0.5rem": "2",
  "8px": "2",
  "0.625rem": "2.5",
  "10px": "2.5",
  "0.75rem": "3",
  "12px": "3",
  "0.875rem": "3.5",
  "14px": "3.5",
  "1rem": "4",
  "16px": "4",
  "1.25rem": "5",
  "20px": "5",
  "1.5rem": "6",
  "24px": "6",
  "1.75rem": "7",
  "28px": "7",
  "2rem": "8",
  "32px": "8",
  "2.25rem": "9",
  "36px": "9",
  "2.5rem": "10",
  "40px": "10",
  "2.75rem": "11",
  "44px": "11",
  "3rem": "12",
  "48px": "12",
  "3.5rem": "14",
  "56px": "14",
  "4rem": "16",
  "64px": "16",
  "5rem": "20",
  "80px": "20",
  "6rem": "24",
  "96px": "24",
  auto: "auto",
  "100%": "full",
  "100vw": "screen",
  "100vh": "screen",
  "50%": "1/2",
  "33.333%": "1/3",
  "66.667%": "2/3",
  "25%": "1/4",
  "75%": "3/4",
};

const fontSizeMap: Record<string, string> = {
  "0.75rem": "text-xs",
  "12px": "text-xs",
  "0.875rem": "text-sm",
  "14px": "text-sm",
  "1rem": "text-base",
  "16px": "text-base",
  "1.125rem": "text-lg",
  "18px": "text-lg",
  "1.25rem": "text-xl",
  "20px": "text-xl",
  "1.5rem": "text-2xl",
  "24px": "text-2xl",
  "1.875rem": "text-3xl",
  "30px": "text-3xl",
  "2.25rem": "text-4xl",
  "36px": "text-4xl",
  "3rem": "text-5xl",
  "48px": "text-5xl",
  "3.75rem": "text-6xl",
  "60px": "text-6xl",
};

const borderRadiusMap: Record<string, string> = {
  "0": "rounded-none",
  "0px": "rounded-none",
  "0.125rem": "rounded-sm",
  "2px": "rounded-sm",
  "0.25rem": "rounded",
  "4px": "rounded",
  "0.375rem": "rounded-md",
  "6px": "rounded-md",
  "0.5rem": "rounded-lg",
  "8px": "rounded-lg",
  "0.75rem": "rounded-xl",
  "12px": "rounded-xl",
  "1rem": "rounded-2xl",
  "16px": "rounded-2xl",
  "1.5rem": "rounded-3xl",
  "24px": "rounded-3xl",
  "9999px": "rounded-full",
  "50%": "rounded-full",
};

const colorMap: Record<string, string> = {
  "#000": "black",
  "#000000": "black",
  black: "black",
  "#fff": "white",
  "#ffffff": "white",
  white: "white",
  transparent: "transparent",
  "#ef4444": "red-500",
  "#f97316": "orange-500",
  "#eab308": "yellow-500",
  "#22c55e": "green-500",
  "#3b82f6": "blue-500",
  "#6366f1": "indigo-500",
  "#a855f7": "purple-500",
  "#ec4899": "pink-500",
  "#6b7280": "gray-500",
  "#9ca3af": "gray-400",
  "#d1d5db": "gray-300",
  "#e5e7eb": "gray-200",
  "#f3f4f6": "gray-100",
  "#f9fafb": "gray-50",
  "#374151": "gray-700",
  "#1f2937": "gray-800",
  "#111827": "gray-900",
  "rgb(0, 0, 0)": "black",
  "rgb(255, 255, 255)": "white",
};

function convertSpacingProp(
  prop: string,
  value: string,
  prefix: string
): string | null {
  const v = value.trim();
  const parts = v.split(/\s+/);

  if (parts.length === 1) {
    const mapped = spacingMap[v];
    if (mapped) return `${prefix}-${mapped}`;
    return `${prefix}-[${v}]`;
  }

  if (parts.length === 2) {
    const yVal = spacingMap[parts[0]] || `[${parts[0]}]`;
    const xVal = spacingMap[parts[1]] || `[${parts[1]}]`;
    return `${prefix}y-${yVal} ${prefix}x-${xVal}`;
  }

  if (parts.length === 4) {
    const dirs = ["t", "r", "b", "l"];
    return parts
      .map((p, i) => {
        const mapped = spacingMap[p] || `[${p}]`;
        return `${prefix}${dirs[i]}-${mapped}`;
      })
      .join(" ");
  }

  return `${prefix}-[${v}]`;
}

function cssPropertyToTailwind(prop: string, value: string): string | null {
  const p = prop.trim().toLowerCase();
  const v = value.trim().toLowerCase().replace(/;$/, "").trim();

  // Direct mapping
  if (cssToTailwind[p] && cssToTailwind[p][v]) {
    return cssToTailwind[p][v];
  }

  // Spacing properties
  if (p === "margin") return convertSpacingProp(p, v, "m");
  if (p === "margin-top") {
    const m = spacingMap[v];
    return m ? `mt-${m}` : `mt-[${v}]`;
  }
  if (p === "margin-right") {
    const m = spacingMap[v];
    return m ? `mr-${m}` : `mr-[${v}]`;
  }
  if (p === "margin-bottom") {
    const m = spacingMap[v];
    return m ? `mb-${m}` : `mb-[${v}]`;
  }
  if (p === "margin-left") {
    const m = spacingMap[v];
    return m ? `ml-${m}` : `ml-[${v}]`;
  }

  if (p === "padding") return convertSpacingProp(p, v, "p");
  if (p === "padding-top") {
    const m = spacingMap[v];
    return m ? `pt-${m}` : `pt-[${v}]`;
  }
  if (p === "padding-right") {
    const m = spacingMap[v];
    return m ? `pr-${m}` : `pr-[${v}]`;
  }
  if (p === "padding-bottom") {
    const m = spacingMap[v];
    return m ? `pb-${m}` : `pb-[${v}]`;
  }
  if (p === "padding-left") {
    const m = spacingMap[v];
    return m ? `pl-${m}` : `pl-[${v}]`;
  }

  if (p === "gap") {
    const m = spacingMap[v];
    return m ? `gap-${m}` : `gap-[${v}]`;
  }

  // Width / Height
  if (p === "width") {
    const m = spacingMap[v];
    return m ? `w-${m}` : `w-[${v}]`;
  }
  if (p === "height") {
    const m = spacingMap[v];
    return m ? `h-${m}` : `h-[${v}]`;
  }
  if (p === "min-width") {
    const m = spacingMap[v];
    return m ? `min-w-${m}` : `min-w-[${v}]`;
  }
  if (p === "min-height") {
    const m = spacingMap[v];
    return m ? `min-h-${m}` : `min-h-[${v}]`;
  }
  if (p === "max-width") {
    const m = spacingMap[v];
    return m ? `max-w-${m}` : `max-w-[${v}]`;
  }
  if (p === "max-height") {
    const m = spacingMap[v];
    return m ? `max-h-${m}` : `max-h-[${v}]`;
  }

  // Font size
  if (p === "font-size") {
    return fontSizeMap[v] || `text-[${v}]`;
  }

  // Line height
  if (p === "line-height") {
    const lhMap: Record<string, string> = {
      "1": "leading-none",
      "1.25": "leading-tight",
      "1.375": "leading-snug",
      "1.5": "leading-normal",
      "1.625": "leading-relaxed",
      "2": "leading-loose",
    };
    return lhMap[v] || `leading-[${v}]`;
  }

  // Border radius
  if (p === "border-radius") {
    return borderRadiusMap[v] || `rounded-[${v}]`;
  }

  // Border width
  if (p === "border-width" || p === "border") {
    if (v === "0" || v === "0px" || v === "none") return "border-0";
    if (v === "1px") return "border";
    if (v === "2px") return "border-2";
    if (v === "4px") return "border-4";
    if (v === "8px") return "border-8";
    return `border-[${v}]`;
  }

  // Colors
  if (p === "color") {
    const c = colorMap[v];
    return c ? `text-${c}` : `text-[${v}]`;
  }
  if (p === "background-color" || p === "background") {
    const c = colorMap[v];
    return c ? `bg-${c}` : `bg-[${v}]`;
  }
  if (p === "border-color") {
    const c = colorMap[v];
    return c ? `border-${c}` : `border-[${v}]`;
  }

  // Opacity
  if (p === "opacity") {
    const pct = Math.round(parseFloat(v) * 100);
    const opMap: Record<number, string> = {
      0: "opacity-0",
      5: "opacity-5",
      10: "opacity-10",
      20: "opacity-20",
      25: "opacity-25",
      30: "opacity-30",
      40: "opacity-40",
      50: "opacity-50",
      60: "opacity-60",
      70: "opacity-70",
      75: "opacity-75",
      80: "opacity-80",
      90: "opacity-90",
      95: "opacity-95",
      100: "opacity-100",
    };
    return opMap[pct] || `opacity-[${v}]`;
  }

  // Z-index
  if (p === "z-index") {
    const zMap: Record<string, string> = {
      "0": "z-0",
      "10": "z-10",
      "20": "z-20",
      "30": "z-30",
      "40": "z-40",
      "50": "z-50",
      auto: "z-auto",
    };
    return zMap[v] || `z-[${v}]`;
  }

  // Top/right/bottom/left
  if (["top", "right", "bottom", "left"].includes(p)) {
    const m = spacingMap[v];
    return m ? `${p}-${m}` : `${p}-[${v}]`;
  }

  // Flex
  if (p === "flex") {
    if (v === "1" || v === "1 1 0%") return "flex-1";
    if (v === "auto" || v === "1 1 auto") return "flex-auto";
    if (v === "initial" || v === "0 1 auto") return "flex-initial";
    if (v === "none" || v === "0 0 auto") return "flex-none";
    return `flex-[${v}]`;
  }

  if (p === "flex-grow") {
    return v === "1" || v === "" ? "grow" : v === "0" ? "grow-0" : `grow-[${v}]`;
  }

  if (p === "flex-shrink") {
    return v === "1" || v === "" ? "shrink" : v === "0" ? "shrink-0" : `shrink-[${v}]`;
  }

  // Transition
  if (p === "transition") {
    if (v === "all") return "transition-all";
    if (v === "none") return "transition-none";
    return `transition`;
  }

  // Box shadow
  if (p === "box-shadow") {
    if (v === "none") return "shadow-none";
    return "shadow";
  }

  // Fallback: arbitrary property
  return `[${p}:${v}]`;
}

function convertCssToTailwind(css: string): string {
  const lines = css
    .split(/[;\n]/)
    .map((l) => l.trim())
    .filter(Boolean);
  const classes: string[] = [];

  for (const line of lines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const prop = line.substring(0, colonIdx).trim();
    const value = line
      .substring(colonIdx + 1)
      .trim()
      .replace(/;$/, "")
      .trim();
    if (!prop || !value) continue;

    const tw = cssPropertyToTailwind(prop, value);
    if (tw) classes.push(tw);
  }

  return classes.join(" ");
}

// Build reverse map for tailwind -> css
const tailwindToCssMap: Record<string, string> = {};

// Simple direct mappings
for (const [cssProp, valMap] of Object.entries(cssToTailwind)) {
  for (const [cssVal, twClass] of Object.entries(valMap)) {
    tailwindToCssMap[twClass] = `${cssProp}: ${cssVal};`;
  }
}

// Add spacing shortcuts
const spacingReverse: Record<string, string> = {};
for (const [cssVal, twVal] of Object.entries(spacingMap)) {
  if (!spacingReverse[twVal]) spacingReverse[twVal] = cssVal;
}

function convertTailwindToCss(tw: string): string {
  const classes = tw.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];

  for (const cls of classes) {
    // Check direct map
    if (tailwindToCssMap[cls]) {
      lines.push(tailwindToCssMap[cls]);
      continue;
    }

    // Font sizes
    const fontSizeReverse: Record<string, string> = {};
    for (const [val, twCls] of Object.entries(fontSizeMap)) {
      if (!fontSizeReverse[twCls]) fontSizeReverse[twCls] = val;
    }
    if (fontSizeReverse[cls]) {
      lines.push(`font-size: ${fontSizeReverse[cls]};`);
      continue;
    }

    // Border radius
    const brReverse: Record<string, string> = {};
    for (const [val, twCls] of Object.entries(borderRadiusMap)) {
      if (!brReverse[twCls]) brReverse[twCls] = val;
    }
    if (brReverse[cls]) {
      lines.push(`border-radius: ${brReverse[cls]};`);
      continue;
    }

    // Spacing: m-X, p-X, mt-X, etc.
    const spacingMatch = cls.match(
      /^(m|p|mt|mr|mb|ml|mx|my|pt|pr|pb|pl|px|py|gap|w|h|min-w|min-h|max-w|max-h|top|right|bottom|left)-(.+)$/
    );
    if (spacingMatch) {
      const prefix = spacingMatch[1];
      const val = spacingMatch[2];
      const cssVal =
        spacingReverse[val] || (val.startsWith("[") ? val.slice(1, -1) : `${Number(val) * 0.25}rem`);

      const propMap: Record<string, string> = {
        m: "margin",
        p: "padding",
        mt: "margin-top",
        mr: "margin-right",
        mb: "margin-bottom",
        ml: "margin-left",
        mx: "margin-left",
        my: "margin-top",
        pt: "padding-top",
        pr: "padding-right",
        pb: "padding-bottom",
        pl: "padding-left",
        px: "padding-left",
        py: "padding-top",
        gap: "gap",
        w: "width",
        h: "height",
        "min-w": "min-width",
        "min-h": "min-height",
        "max-w": "max-width",
        "max-h": "max-height",
        top: "top",
        right: "right",
        bottom: "bottom",
        left: "left",
      };

      const cssProp = propMap[prefix];
      if (cssProp) {
        lines.push(`${cssProp}: ${cssVal};`);
        if (prefix === "mx") lines.push(`margin-right: ${cssVal};`);
        if (prefix === "my") lines.push(`margin-bottom: ${cssVal};`);
        if (prefix === "px") lines.push(`padding-right: ${cssVal};`);
        if (prefix === "py") lines.push(`padding-bottom: ${cssVal};`);
      }
      continue;
    }

    // Colors: text-X, bg-X, border-X
    const colorMatch = cls.match(/^(text|bg|border)-(.+)$/);
    if (colorMatch) {
      const type = colorMatch[1];
      const colorVal = colorMatch[2];
      const reverseColor: Record<string, string> = {};
      for (const [css, tw] of Object.entries(colorMap)) {
        if (!reverseColor[tw]) reverseColor[tw] = css;
      }
      if (reverseColor[colorVal]) {
        const propMap: Record<string, string> = {
          text: "color",
          bg: "background-color",
          border: "border-color",
        };
        lines.push(`${propMap[type]}: ${reverseColor[colorVal]};`);
        continue;
      }
      // Arbitrary value
      if (colorVal.startsWith("[") && colorVal.endsWith("]")) {
        const propMap: Record<string, string> = {
          text: "color",
          bg: "background-color",
          border: "border-color",
        };
        lines.push(`${propMap[type]}: ${colorVal.slice(1, -1)};`);
        continue;
      }
    }

    // Opacity
    const opMatch = cls.match(/^opacity-(\d+)$/);
    if (opMatch) {
      lines.push(`opacity: ${Number(opMatch[1]) / 100};`);
      continue;
    }

    // Z-index
    const zMatch = cls.match(/^z-(.+)$/);
    if (zMatch) {
      lines.push(`z-index: ${zMatch[1]};`);
      continue;
    }

    // Border width
    if (cls === "border") {
      lines.push("border-width: 1px;");
      continue;
    }
    const bwMatch = cls.match(/^border-(\d+)$/);
    if (bwMatch) {
      lines.push(`border-width: ${bwMatch[1]}px;`);
      continue;
    }

    // Arbitrary: [prop:val]
    const arbMatch = cls.match(/^\[(.+):(.+)\]$/);
    if (arbMatch) {
      lines.push(`${arbMatch[1]}: ${arbMatch[2]};`);
      continue;
    }

    // Shadow
    if (cls === "shadow") {
      lines.push("box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);");
      continue;
    }
    if (cls === "shadow-none") {
      lines.push("box-shadow: none;");
      continue;
    }

    // Leading
    const leadMatch = cls.match(/^leading-(.+)$/);
    if (leadMatch) {
      const lhMap: Record<string, string> = {
        none: "1",
        tight: "1.25",
        snug: "1.375",
        normal: "1.5",
        relaxed: "1.625",
        loose: "2",
      };
      const lv = lhMap[leadMatch[1]] || leadMatch[1].replace(/[\[\]]/g, "");
      lines.push(`line-height: ${lv};`);
      continue;
    }

    // Flex shortcuts
    if (cls === "flex-1") {
      lines.push("flex: 1 1 0%;");
      continue;
    }
    if (cls === "flex-auto") {
      lines.push("flex: 1 1 auto;");
      continue;
    }
    if (cls === "flex-none") {
      lines.push("flex: none;");
      continue;
    }
    if (cls === "grow") {
      lines.push("flex-grow: 1;");
      continue;
    }
    if (cls === "grow-0") {
      lines.push("flex-grow: 0;");
      continue;
    }
    if (cls === "shrink") {
      lines.push("flex-shrink: 1;");
      continue;
    }
    if (cls === "shrink-0") {
      lines.push("flex-shrink: 0;");
      continue;
    }

    // Transition
    if (cls === "transition-all") {
      lines.push("transition: all;");
      continue;
    }
    if (cls === "transition-none") {
      lines.push("transition: none;");
      continue;
    }
    if (cls === "transition") {
      lines.push(
        "transition: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;"
      );
      continue;
    }

    // Unknown - comment it
    lines.push(`/* unknown: ${cls} */`);
  }

  return lines.join("\n");
}

const sampleCss = `display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
padding: 16px 24px;
margin-top: 8px;
margin-bottom: 16px;
background-color: #ffffff;
color: #1f2937;
font-size: 14px;
font-weight: 700;
border-radius: 8px;
border: 1px;
border-style: solid;
border-color: #d1d5db;
cursor: pointer;
overflow: hidden;
width: 100%;
gap: 8px;`;

const sampleTailwind =
  "flex flex-col items-center justify-center px-6 py-4 mt-2 mb-4 bg-white text-gray-800 text-sm font-bold rounded-lg border border-solid border-gray-300 cursor-pointer overflow-hidden w-full gap-2";

export default function TailwindConverterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<"cssToTw" | "twToCss">("cssToTw");

  const convert = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }
    try {
      if (mode === "cssToTw") {
        setOutput(convertCssToTailwind(input));
      } else {
        setOutput(convertTailwindToCss(input));
      }
      setError(null);
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  }, [input, mode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        convert();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [convert]);

  const copyToClipboard = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const loadSample = () => {
    if (mode === "cssToTw") {
      setInput(sampleCss);
    } else {
      setInput(sampleTailwind);
    }
    setOutput("");
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tailwind CSS Converter</h1>
        <p className="text-muted-foreground mt-1">
          Convert between inline CSS and Tailwind CSS classes. 100% client-side
          processing.
        </p>
        <Badge variant="secondary" className="mt-2">
          No data sent to server
        </Badge>
      </div>

      <div className="flex gap-2">
        <Button
          size="lg"
          variant={mode === "cssToTw" ? "default" : "secondary"}
          onClick={() => {
            setMode("cssToTw");
            setInput("");
            setOutput("");
            setError(null);
          }}
        >
          CSS &rarr; Tailwind
        </Button>
        <Button
          size="lg"
          variant={mode === "twToCss" ? "default" : "secondary"}
          onClick={() => {
            setMode("twToCss");
            setInput("");
            setOutput("");
            setError(null);
          }}
        >
          Tailwind &rarr; CSS
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">
                {mode === "cssToTw" ? "CSS Input" : "Tailwind Classes Input"}
              </CardTitle>
              <div className="flex gap-1">
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
                mode === "cssToTw"
                  ? "Enter CSS properties...\ne.g. display: flex;\npadding: 16px;"
                  : "Enter Tailwind classes...\ne.g. flex p-4 items-center"
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
                {mode === "cssToTw" ? "Tailwind Classes Output" : "CSS Output"}
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

      <div className="flex flex-wrap items-center gap-3">
        <Button size="lg" onClick={convert}>
          Convert
        </Button>
        <span className="text-xs text-muted-foreground ml-2">Ctrl+Enter</span>
      </div>

      {/* Related Tools */}
      <section className="py-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Color Converter", href: "/tools/color-converter" },
            { name: "Markdown Preview", href: "/tools/markdown-preview" },
            { name: "JSON Formatter", href: "/tools/json-formatter" },
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
            <TabsTrigger value="what">What is Tailwind CSS?</TabsTrigger>
            <TabsTrigger value="how">How to Use</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent
            value="what"
            className="mt-4 space-y-3 text-muted-foreground text-sm"
          >
            <h2 className="text-lg font-semibold text-foreground">
              What is Tailwind CSS?
            </h2>
            <p>
              Tailwind CSS is a utility-first CSS framework that provides
              low-level utility classes to build custom designs directly in your
              markup. Instead of writing custom CSS, you compose designs using
              pre-built classes like &quot;flex&quot;, &quot;p-4&quot;,
              &quot;text-center&quot;, and &quot;bg-blue-500&quot;.
            </p>
            <h3 className="text-base font-semibold text-foreground">
              Why Convert Between CSS and Tailwind?
            </h3>
            <p>
              When migrating an existing project to Tailwind CSS, you often need
              to convert inline CSS or stylesheet rules to Tailwind utility
              classes. Conversely, when debugging or documenting, you may need to
              see the actual CSS that Tailwind classes produce. This converter
              handles both directions instantly.
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
              <li>
                Select the conversion direction: CSS to Tailwind or Tailwind to
                CSS.
              </li>
              <li>
                Paste your CSS properties or Tailwind classes in the input field.
              </li>
              <li>Click Convert to see the result.</li>
              <li>Copy the output to your clipboard.</li>
            </ol>
          </TabsContent>

          <TabsContent
            value="faq"
            className="mt-4 space-y-4 text-muted-foreground text-sm"
          >
            <h2 className="text-lg font-semibold text-foreground">FAQ</h2>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Does this support all CSS properties?
              </h3>
              <p>
                This converter handles the most common CSS properties including
                display, flexbox, spacing (margin/padding), colors, font
                properties, borders, sizing, and more. For unsupported
                properties, it generates Tailwind arbitrary value syntax like
                [property:value].
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Is the conversion 100% accurate?
              </h3>
              <p>
                The converter handles common cases well but may not perfectly
                match every edge case. Complex shorthand properties, custom
                colors, and responsive/hover variants require manual adjustment.
                Always review the output before using it in production.
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
