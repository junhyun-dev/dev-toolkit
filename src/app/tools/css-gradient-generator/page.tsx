"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DIRECTIONS = [
  { label: "→ Right", value: "to right" },
  { label: "↓ Bottom", value: "to bottom" },
  { label: "↙ Bottom Left", value: "to bottom left" },
  { label: "↘ Bottom Right", value: "to bottom right" },
  { label: "↑ Top", value: "to top" },
  { label: "↖ Top Left", value: "to top left" },
  { label: "↗ Top Right", value: "to top right" },
  { label: "← Left", value: "to left" },
  { label: "Custom Angle", value: "custom" },
];

const PRESETS = [
  { name: "Ocean", colors: ["#0ea5e9", "#6366f1"] },
  { name: "Sunset", colors: ["#f97316", "#ec4899"] },
  { name: "Forest", colors: ["#22c55e", "#14b8a6"] },
  { name: "Purple Haze", colors: ["#a855f7", "#ec4899", "#f43f5e"] },
  { name: "Gold", colors: ["#fbbf24", "#f59e0b"] },
  { name: "Midnight", colors: ["#1e1b4b", "#4c1d95"] },
];

export default function CssGradientGeneratorPage() {
  const [colors, setColors] = useState(["#6366f1", "#ec4899"]);
  const [direction, setDirection] = useState("to right");
  const [customAngle, setCustomAngle] = useState(90);
  const [copied, setCopied] = useState(false);

  const dir = direction === "custom" ? `${customAngle}deg` : direction;
  const gradientValue = `linear-gradient(${dir}, ${colors.join(", ")})`;
  const css = `background: ${gradientValue};`;

  const addColor = () => {
    if (colors.length < 5) setColors([...colors, "#ffffff"]);
  };

  const removeColor = (idx: number) => {
    if (colors.length > 2) setColors(colors.filter((_, i) => i !== idx));
  };

  const updateColor = (idx: number, val: string) => {
    const next = [...colors];
    next[idx] = val;
    setColors(next);
  };

  const copyCSS = async () => {
    await navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const applyPreset = (preset: { name: string; colors: string[] }) => {
    setColors(preset.colors);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">CSS Gradient Generator</h1>
        <p className="text-muted-foreground mt-1">
          Build linear gradients visually. Pick colors, set direction, and copy the CSS.
        </p>
        <Badge variant="secondary" className="mt-2">
          Live Preview
        </Badge>
      </div>

      {/* Live Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="w-full h-40 rounded-md"
            style={{ background: gradientValue }}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Color Stops */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Color Stops</CardTitle>
              <Button variant="ghost" size="sm" onClick={addColor} disabled={colors.length >= 5}>
                + Add Color
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {colors.map((color, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => updateColor(idx, e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border border-border bg-transparent"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => updateColor(idx, e.target.value)}
                  className="flex-1 font-mono text-sm bg-muted px-3 py-2 rounded-md border border-border"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeColor(idx)}
                  disabled={colors.length <= 2}
                  className="text-muted-foreground hover:text-destructive"
                >
                  ✕
                </Button>
              </div>
            ))}

            {/* Presets */}
            <div className="pt-3 border-t">
              <div className="text-xs text-muted-foreground mb-2">Presets</div>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <span
                      className="inline-block w-4 h-4 rounded-sm"
                      style={{ background: `linear-gradient(to right, ${preset.colors.join(", ")})` }}
                    />
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Direction */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Direction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {DIRECTIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDirection(d.value)}
                  className={`text-xs px-3 py-2 rounded-md text-left transition-colors ${
                    direction === d.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {direction === "custom" && (
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Angle</span>
                  <span className="text-xs font-mono">{customAngle}deg</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={customAngle}
                  onChange={(e) => setCustomAngle(parseInt(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* CSS Output */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Generated CSS</CardTitle>
            <Button variant="ghost" size="sm" onClick={copyCSS}>
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="font-mono text-sm bg-muted px-3 py-3 rounded-md overflow-auto">
            {css}
          </pre>
          <div className="mt-2 text-xs text-muted-foreground font-mono">
            {`background: -webkit-${gradientValue};`}
          </div>
        </CardContent>
      </Card>

      {/* Related Tools */}
      <section className="py-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Color Converter", href: "/tools/color-converter" },
            { name: "SVG Optimizer", href: "/tools/svg-optimizer" },
            { name: "Tailwind Converter", href: "/tools/tailwind-converter" },
            { name: "Meta Tag Generator", href: "/tools/meta-tag-generator" },
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

      <section className="space-y-4 py-8 border-t">
        <Tabs defaultValue="what">
          <TabsList>
            <TabsTrigger value="what">What is CSS Gradient?</TabsTrigger>
            <TabsTrigger value="how">How to Use</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="what" className="mt-4 space-y-3 text-muted-foreground text-sm">
            <h2 className="text-lg font-semibold text-foreground">What is a CSS Gradient?</h2>
            <p>
              CSS gradients let you display smooth transitions between two or more colors without using
              image files. A <code className="font-mono text-xs bg-muted px-1 rounded">linear-gradient</code> transitions
              along a straight line in a specified direction or angle.
              They are supported in all modern browsers and are used extensively for
              backgrounds, buttons, hero sections, and decorative elements.
            </p>
            <h3 className="text-base font-semibold text-foreground">Types of CSS Gradients</h3>
            <p>
              Linear gradients go in a straight line. Radial gradients radiate outward from a center
              point. Conic gradients rotate around a center. This tool focuses on linear gradients,
              the most commonly used type in UI design.
            </p>
          </TabsContent>

          <TabsContent value="how" className="mt-4 space-y-3 text-muted-foreground text-sm">
            <h2 className="text-lg font-semibold text-foreground">How to Use</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Pick two or more colors using the color pickers, or click a preset.</li>
              <li>Select a direction or enter a custom angle.</li>
              <li>The live preview updates instantly.</li>
              <li>Click Copy to copy the CSS to your clipboard.</li>
              <li>Paste into your stylesheet.</li>
            </ol>
          </TabsContent>

          <TabsContent value="faq" className="mt-4 space-y-4 text-muted-foreground text-sm">
            <h2 className="text-lg font-semibold text-foreground">FAQ</h2>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Do I need the -webkit- prefix?</h3>
              <p>
                For modern browsers (2020+), the unprefixed version is sufficient. The -webkit- prefix
                is shown for completeness if you need to support older browsers.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Can I add more than 2 colors?</h3>
              <p>
                Yes. Click &quot;Add Color&quot; to add up to 5 color stops. Remove any stop with the ✕ button.
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
