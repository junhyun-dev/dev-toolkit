"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ColorValues {
  hex: string;
  rgb: string;
  hsl: string;
  oklch: string;
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

function hexToRgb(hex: string): [number, number, number] | null {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  if (h.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((c) =>
        clamp(Math.round(c), 0, 255)
          .toString(16)
          .padStart(2, "0")
      )
      .join("")
  );
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360;
  s = clamp(s, 0, 100) / 100;
  l = clamp(l, 0, 100) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

// sRGB linear conversion
function srgbToLinear(c: number): number {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearToSrgb(c: number): number {
  c = clamp(c, 0, 1);
  return c <= 0.0031308 ? Math.round(c * 12.92 * 255) : Math.round((1.055 * Math.pow(c, 1 / 2.4) - 0.055) * 255);
}

function rgbToOklch(r: number, g: number, b: number): [number, number, number] {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  const l_ = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m_ = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s_ = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  const l1 = Math.cbrt(l_);
  const m1 = Math.cbrt(m_);
  const s1 = Math.cbrt(s_);

  const L = 0.2104542553 * l1 + 0.7936177850 * m1 - 0.0040720468 * s1;
  const a = 1.9779984951 * l1 - 2.4285922050 * m1 + 0.4505937099 * s1;
  const bv = 0.0259040371 * l1 + 0.7827717662 * m1 - 0.8086757660 * s1;

  const C = Math.sqrt(a * a + bv * bv);
  let H = (Math.atan2(bv, a) * 180) / Math.PI;
  if (H < 0) H += 360;

  return [
    Math.round(L * 1000) / 1000,
    Math.round(C * 1000) / 1000,
    Math.round(H * 10) / 10,
  ];
}

function oklchToRgb(L: number, C: number, H: number): [number, number, number] {
  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  const l1 = L + 0.3963377774 * a + 0.2158037573 * b;
  const m1 = L - 0.1055613458 * a - 0.0638541728 * b;
  const s1 = L - 0.0894841775 * a - 1.2914855480 * b;

  const l_ = l1 * l1 * l1;
  const m_ = m1 * m1 * m1;
  const s_ = s1 * s1 * s1;

  const r = 4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_;
  const g = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_;
  const bv = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.7076147010 * s_;

  return [linearToSrgb(r), linearToSrgb(g), linearToSrgb(bv)];
}

function parseColor(input: string): [number, number, number] | null {
  const trimmed = input.trim().toLowerCase();

  // HEX
  if (trimmed.startsWith("#") || /^[0-9a-f]{3,6}$/i.test(trimmed)) {
    const hex = trimmed.startsWith("#") ? trimmed : "#" + trimmed;
    return hexToRgb(hex);
  }

  // RGB
  const rgbMatch = trimmed.match(
    /rgba?\s*\(\s*(\d+)\s*[,\s]\s*(\d+)\s*[,\s]\s*(\d+)\s*(?:[,/]\s*[\d.]+\s*)?\)/
  );
  if (rgbMatch) {
    return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])];
  }

  // HSL
  const hslMatch = trimmed.match(
    /hsla?\s*\(\s*([\d.]+)\s*[,\s]\s*([\d.]+)%?\s*[,\s]\s*([\d.]+)%?\s*(?:[,/]\s*[\d.]+\s*)?\)/
  );
  if (hslMatch) {
    return hslToRgb(parseFloat(hslMatch[1]), parseFloat(hslMatch[2]), parseFloat(hslMatch[3]));
  }

  // OKLCH
  const oklchMatch = trimmed.match(
    /oklch\s*\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*[\d.]+\s*)?\)/
  );
  if (oklchMatch) {
    return oklchToRgb(
      parseFloat(oklchMatch[1]),
      parseFloat(oklchMatch[2]),
      parseFloat(oklchMatch[3])
    );
  }

  // Also try OKLCH with percentage L
  const oklchPctMatch = trimmed.match(
    /oklch\s*\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*[\d.]+\s*)?\)/
  );
  if (oklchPctMatch) {
    return oklchToRgb(
      parseFloat(oklchPctMatch[1]) / 100,
      parseFloat(oklchPctMatch[2]),
      parseFloat(oklchPctMatch[3])
    );
  }

  return null;
}

function rgbToAllFormats(r: number, g: number, b: number): ColorValues {
  const [h, s, l] = rgbToHsl(r, g, b);
  const [oL, oC, oH] = rgbToOklch(r, g, b);
  return {
    hex: rgbToHex(r, g, b),
    rgb: `rgb(${r}, ${g}, ${b})`,
    hsl: `hsl(${h}, ${s}%, ${l}%)`,
    oklch: `oklch(${oL} ${oC} ${oH})`,
  };
}

export default function ColorConverterPage() {
  const [input, setInput] = useState("");
  const [colors, setColors] = useState<ColorValues | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [pickerColor, setPickerColor] = useState("#3b82f6");

  const convert = useCallback(() => {
    if (!input.trim()) {
      setColors(null);
      setError(null);
      return;
    }
    const rgb = parseColor(input);
    if (!rgb) {
      setError(
        "Invalid color format. Supported: HEX (#ff0000), RGB (rgb(255,0,0)), HSL (hsl(0,100%,50%)), OKLCH (oklch(0.63 0.26 29.2))"
      );
      setColors(null);
      return;
    }
    setColors(rgbToAllFormats(rgb[0], rgb[1], rgb[2]));
    setError(null);
  }, [input]);

  // Auto-convert on input change
  useEffect(() => {
    const timeout = setTimeout(convert, 300);
    return () => clearTimeout(timeout);
  }, [convert]);

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    setPickerColor(hex);
    setInput(hex);
  };

  const copyValue = useCallback(async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const loadSample = () => {
    setInput("#3b82f6");
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Color Converter</h1>
        <p className="text-muted-foreground mt-1">
          Convert colors between HEX, RGB, HSL, and OKLCH formats with live
          preview. 100% client-side processing.
        </p>
        <Badge variant="secondary" className="mt-2">
          No data sent to server
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Color Input</CardTitle>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={loadSample}>
                  Sample
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setInput("");
                    setColors(null);
                    setError(null);
                  }}
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter any color format...&#10;#ff5733&#10;rgb(255, 87, 51)&#10;hsl(11, 100%, 60%)&#10;oklch(0.7 0.18 40)"
              className="font-mono text-sm min-h-[120px] resize-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <div className="flex items-center gap-3">
              <label className="text-sm text-muted-foreground">
                Color Picker:
              </label>
              <input
                type="color"
                value={pickerColor}
                onChange={handlePickerChange}
                className="w-12 h-10 rounded cursor-pointer border border-border"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Converted Colors</CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="font-mono text-sm min-h-[120px] p-3 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
                Error: {error}
              </div>
            ) : colors ? (
              <div className="space-y-3">
                {/* Color preview */}
                <div
                  className="w-full h-20 rounded-lg border border-border"
                  style={{ backgroundColor: colors.hex }}
                />

                {(
                  [
                    ["HEX", colors.hex],
                    ["RGB", colors.rgb],
                    ["HSL", colors.hsl],
                    ["OKLCH", colors.oklch],
                  ] as const
                ).map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between p-2 rounded-md bg-muted/50 font-mono text-sm"
                  >
                    <div>
                      <span className="text-muted-foreground mr-2 font-sans text-xs font-semibold">
                        {label}
                      </span>
                      {value}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyValue(value, label)}
                    >
                      {copied === label ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground min-h-[120px] flex items-center justify-center">
                Enter a color to see all format conversions
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Related Tools */}
      <section className="py-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Tailwind Converter", href: "/tools/tailwind-converter" },
            { name: "Regex Tester", href: "/tools/regex-tester" },
            { name: "Base64 Encoder", href: "/tools/base64-encoder" },
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
            <TabsTrigger value="what">What is Color Conversion?</TabsTrigger>
            <TabsTrigger value="how">How to Use</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent
            value="what"
            className="mt-4 space-y-3 text-muted-foreground text-sm"
          >
            <h2 className="text-lg font-semibold text-foreground">
              Understanding Color Formats
            </h2>
            <p>
              Colors on the web can be represented in multiple formats. HEX uses
              hexadecimal values (#RRGGBB), RGB specifies red, green, and blue
              channels (0-255), HSL uses hue (0-360), saturation, and lightness
              percentages, and OKLCH is a perceptually uniform color space that
              provides better color manipulation with lightness, chroma, and hue
              components.
            </p>
            <h3 className="text-base font-semibold text-foreground">
              Why OKLCH?
            </h3>
            <p>
              OKLCH is becoming the preferred color space for modern CSS. It
              provides perceptually uniform lightness (unlike HSL), making it
              easier to create consistent color palettes and accessible color
              schemes. It is supported in all modern browsers via the CSS
              oklch() function.
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
                Enter a color in any supported format (HEX, RGB, HSL, or OKLCH)
                in the input field.
              </li>
              <li>
                The tool auto-detects the format and shows all conversions
                instantly.
              </li>
              <li>Use the color picker to visually select a color.</li>
              <li>Click Copy next to any format to copy it to your clipboard.</li>
            </ol>
          </TabsContent>

          <TabsContent
            value="faq"
            className="mt-4 space-y-4 text-muted-foreground text-sm"
          >
            <h2 className="text-lg font-semibold text-foreground">FAQ</h2>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                What color formats are supported?
              </h3>
              <p>
                This tool supports HEX (#rgb, #rrggbb), RGB (rgb(r, g, b)), HSL
                (hsl(h, s%, l%)), and OKLCH (oklch(L C H)). Alpha/opacity
                channels in the input are recognized but not included in the
                output.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Is OKLCH conversion accurate?
              </h3>
              <p>
                Yes, the conversion uses the standard OKLab color space
                transformation. However, some OKLCH colors may fall outside the
                sRGB gamut, in which case the RGB values are clamped to the
                nearest valid sRGB color.
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
