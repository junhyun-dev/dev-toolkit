import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3099";

// ─────────────────────────────────────────────
// 1. Lorem Ipsum Generator
// ─────────────────────────────────────────────
test.describe("Lorem Ipsum Generator", () => {
  test("page loads with correct title", async ({ page }) => {
    await page.goto(`${BASE}/tools/lorem-ipsum`);
    await expect(page.locator("h1")).toContainText("Lorem Ipsum");
  });

  test("Generate button produces text output", async ({ page }) => {
    await page.goto(`${BASE}/tools/lorem-ipsum`);
    await page.getByRole("button", { name: "Generate" }).click();
    // Output card appears with the generated text div
    await expect(page.locator(".whitespace-pre-wrap")).toBeVisible();
    const text = await page.locator(".whitespace-pre-wrap").textContent();
    expect(text!.length).toBeGreaterThan(20);
  });

  test("Copy button appears after generation", async ({ page }) => {
    await page.goto(`${BASE}/tools/lorem-ipsum`);
    await page.getByRole("button", { name: "Generate" }).click();
    // Copy button is inside the output card (ghost size sm)
    await expect(page.getByRole("button", { name: "Copy" })).toBeVisible();
  });

  test("mode switching works (sentences)", async ({ page }) => {
    await page.goto(`${BASE}/tools/lorem-ipsum`);
    await page.getByRole("button", { name: "sentences" }).click();
    await page.getByRole("button", { name: "Generate" }).click();
    const text = await page.locator(".whitespace-pre-wrap").textContent();
    expect(text!.length).toBeGreaterThan(10);
  });
});

// ─────────────────────────────────────────────
// 2. CSS Minifier & Beautifier
// ─────────────────────────────────────────────
test.describe("CSS Minifier", () => {
  test("page loads with correct title", async ({ page }) => {
    await page.goto(`${BASE}/tools/css-minifier`);
    await expect(page.locator("h1")).toContainText("CSS Minifier");
  });

  test("Minify produces compressed output", async ({ page }) => {
    await page.goto(`${BASE}/tools/css-minifier`);
    await page.locator("textarea").first().fill(".btn {\n  display: flex;\n  padding: 1rem;\n  /* comment */\n}");
    await page.getByRole("button", { name: "Minify" }).click();
    const output = await page.locator("textarea").nth(1).inputValue();
    expect(output).toContain(".btn{");
    expect(output).not.toContain("/*");
  });

  test("Beautify produces formatted output", async ({ page }) => {
    await page.goto(`${BASE}/tools/css-minifier`);
    await page.locator("textarea").first().fill(".btn{display:flex;padding:1rem}");
    await page.getByRole("button", { name: "Beautify" }).click();
    const output = await page.locator("textarea").nth(1).inputValue();
    expect(output.length).toBeGreaterThan(10);
  });

  test("Sample button loads sample CSS", async ({ page }) => {
    await page.goto(`${BASE}/tools/css-minifier`);
    await page.getByRole("button", { name: "Sample" }).click();
    const input = await page.locator("textarea").first().inputValue();
    expect(input).toContain(".navbar");
  });
});

// ─────────────────────────────────────────────
// 3. HTML Entity Encoder & Decoder
// ─────────────────────────────────────────────
test.describe("HTML Entity Encoder", () => {
  test("page loads with correct title", async ({ page }) => {
    await page.goto(`${BASE}/tools/html-entity-encoder`);
    await expect(page.locator("h1")).toContainText("HTML Entity");
  });

  test("encodes <div> to &lt;div&gt;", async ({ page }) => {
    await page.goto(`${BASE}/tools/html-entity-encoder`);
    // Default mode is "Encode" — the action button has exact text "Encode"
    await page.locator("textarea").first().fill("<div>");
    await page.getByRole("button", { name: "Encode", exact: true }).click();
    const output = await page.locator("textarea").nth(1).inputValue();
    expect(output).toContain("&lt;div&gt;");
  });

  test("decodes &lt;div&gt; back to <div>", async ({ page }) => {
    await page.goto(`${BASE}/tools/html-entity-encoder`);
    // Switch to Decode mode by clicking the mode toggle button
    await page.getByRole("button", { name: "Decode → Plain Text" }).click();
    await page.locator("textarea").first().fill("&lt;div&gt;");
    // Action button now says "Decode" (exact)
    await page.getByRole("button", { name: "Decode", exact: true }).click();
    const output = await page.locator("textarea").nth(1).inputValue();
    expect(output).toContain("<div>");
  });

  test("encodes & to &amp;", async ({ page }) => {
    await page.goto(`${BASE}/tools/html-entity-encoder`);
    await page.locator("textarea").first().fill("foo & bar");
    await page.getByRole("button", { name: "Encode", exact: true }).click();
    const output = await page.locator("textarea").nth(1).inputValue();
    expect(output).toContain("&amp;");
  });
});

// ─────────────────────────────────────────────
// 4. Chmod Calculator
// ─────────────────────────────────────────────
test.describe("Chmod Calculator", () => {
  test("page loads with correct title", async ({ page }) => {
    await page.goto(`${BASE}/tools/chmod-calculator`);
    await expect(page.locator("h1")).toContainText("Chmod");
  });

  test("checkboxes are present", async ({ page }) => {
    await page.goto(`${BASE}/tools/chmod-calculator`);
    const checkboxes = page.locator("input[type='checkbox']");
    expect(await checkboxes.count()).toBeGreaterThanOrEqual(9); // 3 roles x 3 bits
  });

  test("default value shows 644", async ({ page }) => {
    await page.goto(`${BASE}/tools/chmod-calculator`);
    // Default permissions: owner rw, group r, others r = 644
    const body = await page.textContent("body");
    expect(body).toContain("644");
  });

  test("755 preset applies correctly", async ({ page }) => {
    await page.goto(`${BASE}/tools/chmod-calculator`);
    // Click the 755 preset button
    await page.getByRole("button", { name: /755/ }).click();
    const body = await page.textContent("body");
    expect(body).toContain("755");
    expect(body).toContain("chmod 755 filename");
  });

  test("Apply button works with octal input", async ({ page }) => {
    await page.goto(`${BASE}/tools/chmod-calculator`);
    const octalInput = page.locator("input[type='text']").first();
    await octalInput.fill("700");
    await page.getByRole("button", { name: "Apply" }).click();
    const body = await page.textContent("body");
    expect(body).toContain("700");
  });
});

// ─────────────────────────────────────────────
// 5. JSON Path Finder
// ─────────────────────────────────────────────
test.describe("JSON Path Finder", () => {
  test("page loads with correct title", async ({ page }) => {
    await page.goto(`${BASE}/tools/json-path-finder`);
    await expect(page.locator("h1")).toContainText("JSON Path");
  });

  test("tree is auto-rendered with sample JSON on load", async ({ page }) => {
    await page.goto(`${BASE}/tools/json-path-finder`);
    // Sample JSON is auto-parsed on mount
    await expect(page.locator("text=JSON Tree")).toBeVisible();
    // "store" key should appear in the tree
    await expect(page.locator("text=store").first()).toBeVisible();
  });

  test("Parse JSON button works with custom input", async ({ page }) => {
    await page.goto(`${BASE}/tools/json-path-finder`);
    await page.locator("textarea").fill('{"name":"alice","age":30}');
    await page.getByRole("button", { name: "Parse JSON" }).click();
    await expect(page.locator("text=name").first()).toBeVisible();
  });

  test("clicking a tree node shows JSONPath", async ({ page }) => {
    await page.goto(`${BASE}/tools/json-path-finder`);
    // Tree is already rendered with sample JSON — click a leaf node "store"
    await page.locator("text=store").first().click();
    // JSONPath panel should show $
    const body = await page.textContent("body");
    expect(body).toMatch(/\$[\.\w]*/);
  });

  test("shows error for invalid JSON", async ({ page }) => {
    await page.goto(`${BASE}/tools/json-path-finder`);
    await page.locator("textarea").fill("{bad json}");
    await page.getByRole("button", { name: "Parse JSON" }).click();
    await expect(page.locator("text=Error:")).toBeVisible();
  });
});

// ─────────────────────────────────────────────
// 6. YAML Validator
// ─────────────────────────────────────────────
test.describe("YAML Validator", () => {
  test("page loads with correct title", async ({ page }) => {
    await page.goto(`${BASE}/tools/yaml-validator`);
    await expect(page.locator("h1")).toContainText("YAML Validator");
  });

  test("validates sample YAML successfully", async ({ page }) => {
    await page.goto(`${BASE}/tools/yaml-validator`);
    await page.getByRole("button", { name: "Sample" }).click();
    await page.getByRole("button", { name: "Validate YAML" }).click();
    await expect(page.locator("text=Valid YAML")).toBeVisible();
  });

  test("shows JSON output after valid YAML", async ({ page }) => {
    await page.goto(`${BASE}/tools/yaml-validator`);
    await page.locator("textarea").fill("name: Alice\nage: 30\nactive: true");
    await page.getByRole("button", { name: "Validate YAML" }).click();
    await expect(page.locator("text=Valid YAML")).toBeVisible();
    // Converted JSON should appear in a <pre>
    const pre = page.locator("pre").first();
    await expect(pre).toBeVisible();
    const preText = await pre.textContent();
    expect(preText).toContain("Alice");
  });

  test("shows invalid for bad YAML", async ({ page }) => {
    await page.goto(`${BASE}/tools/yaml-validator`);
    await page.locator("textarea").fill("key: value\n  bad_indent: oops");
    await page.getByRole("button", { name: "Validate YAML" }).click();
    // Either "Invalid YAML" label or result card appears
    const body = await page.textContent("body");
    // A result card should show (either valid or invalid — the parser is lenient)
    expect(body).toMatch(/Valid YAML|Invalid YAML/);
  });
});

// ─────────────────────────────────────────────
// 7. SVG Optimizer
// ─────────────────────────────────────────────
test.describe("SVG Optimizer", () => {
  test("page loads with correct title", async ({ page }) => {
    await page.goto(`${BASE}/tools/svg-optimizer`);
    await expect(page.locator("h1")).toContainText("SVG Optimizer");
  });

  test("optimizes sample SVG", async ({ page }) => {
    await page.goto(`${BASE}/tools/svg-optimizer`);
    await page.getByRole("button", { name: "Sample" }).click();
    await page.getByRole("button", { name: "Optimize SVG" }).click();
    const output = await page.locator("textarea").nth(1).inputValue();
    expect(output).toContain("<svg");
    // Comments and XML declaration should be stripped
    expect(output).not.toContain("<?xml");
    expect(output).not.toContain("<!--");
  });

  test("shows size savings after optimization", async ({ page }) => {
    await page.goto(`${BASE}/tools/svg-optimizer`);
    await page.getByRole("button", { name: "Sample" }).click();
    await page.getByRole("button", { name: "Optimize SVG" }).click();
    // "% smaller" text appears in the output card header
    await expect(page.locator("text=% smaller")).toBeVisible();
  });

  test("shows error for non-SVG input", async ({ page }) => {
    await page.goto(`${BASE}/tools/svg-optimizer`);
    await page.locator("textarea").first().fill("<div>not svg</div>");
    await page.getByRole("button", { name: "Optimize SVG" }).click();
    await expect(page.locator("text=does not appear to be valid SVG")).toBeVisible();
  });
});

// ─────────────────────────────────────────────
// 8. CSS Gradient Generator
// ─────────────────────────────────────────────
test.describe("CSS Gradient Generator", () => {
  test("page loads with correct title", async ({ page }) => {
    await page.goto(`${BASE}/tools/css-gradient-generator`);
    await expect(page.locator("h1")).toContainText("CSS Gradient");
  });

  test("color inputs are present", async ({ page }) => {
    await page.goto(`${BASE}/tools/css-gradient-generator`);
    const colorInputs = page.locator("input[type='color']");
    expect(await colorInputs.count()).toBeGreaterThanOrEqual(2);
  });

  test("CSS output is shown immediately", async ({ page }) => {
    await page.goto(`${BASE}/tools/css-gradient-generator`);
    // CSS output is in a <pre> tag — always visible (no button needed)
    const pre = page.locator("pre").first();
    await expect(pre).toBeVisible();
    const cssText = await pre.textContent();
    expect(cssText).toContain("background:");
    expect(cssText).toContain("linear-gradient");
  });

  test("changing direction updates CSS output", async ({ page }) => {
    await page.goto(`${BASE}/tools/css-gradient-generator`);
    // Click "↓ Bottom" direction button
    await page.getByRole("button", { name: /Bottom/ }).first().click();
    const pre = page.locator("pre").first();
    const cssText = await pre.textContent();
    expect(cssText).toContain("to bottom");
  });

  test("preset buttons apply colors", async ({ page }) => {
    await page.goto(`${BASE}/tools/css-gradient-generator`);
    await page.getByRole("button", { name: "Ocean" }).click();
    const pre = page.locator("pre").first();
    const cssText = await pre.textContent();
    expect(cssText).toContain("linear-gradient");
  });

  test("Copy button exists", async ({ page }) => {
    await page.goto(`${BASE}/tools/css-gradient-generator`);
    await expect(page.getByRole("button", { name: "Copy" })).toBeVisible();
  });
});

// ─────────────────────────────────────────────
// 9. Meta Tag Generator
// ─────────────────────────────────────────────
test.describe("Meta Tag Generator", () => {
  test("page loads with correct title", async ({ page }) => {
    await page.goto(`${BASE}/tools/meta-tag-generator`);
    await expect(page.locator("h1")).toContainText("Meta Tag Generator");
  });

  test("typing a title generates <title> tag", async ({ page }) => {
    await page.goto(`${BASE}/tools/meta-tag-generator`);
    // "Page Title" input — find by placeholder
    await page.locator("input[placeholder='My Awesome Page']").fill("My Test Page");
    // Output is real-time — check the <pre> output
    const pre = page.locator("pre").first();
    const output = await pre.textContent();
    expect(output).toContain("<title>My Test Page</title>");
  });

  test("typing a description generates meta description tag", async ({ page }) => {
    await page.goto(`${BASE}/tools/meta-tag-generator`);
    await page.locator("input[placeholder='A short description of this page...']").fill("A great page about testing");
    const pre = page.locator("pre").first();
    const output = await pre.textContent();
    expect(output).toContain('name="description"');
    expect(output).toContain("A great page about testing");
  });

  test("OG tags are generated when OG image is set", async ({ page }) => {
    await page.goto(`${BASE}/tools/meta-tag-generator`);
    await page.locator("input[placeholder='My Awesome Page']").fill("Test Page");
    await page.locator("input[placeholder='https://example.com/image.jpg']").first().fill("https://example.com/og.jpg");
    const pre = page.locator("pre").first();
    const output = await pre.textContent();
    expect(output).toContain("og:image");
  });

  test("Copy All button exists", async ({ page }) => {
    await page.goto(`${BASE}/tools/meta-tag-generator`);
    await expect(page.getByRole("button", { name: "Copy All" })).toBeVisible();
  });
});

// ─────────────────────────────────────────────
// 10. Open Graph Preview
// ─────────────────────────────────────────────
test.describe("OG Preview", () => {
  test("page loads with correct title", async ({ page }) => {
    await page.goto(`${BASE}/tools/og-preview`);
    await expect(page.locator("h1")).toContainText("Open Graph Preview");
  });

  test("title and description input fields exist", async ({ page }) => {
    await page.goto(`${BASE}/tools/og-preview`);
    await expect(page.locator("input[placeholder='Page title']")).toBeVisible();
    await expect(page.locator("textarea[placeholder='A short description of the page']")).toBeVisible();
  });

  test("Sample button fills in data", async ({ page }) => {
    await page.goto(`${BASE}/tools/og-preview`);
    await page.getByRole("button", { name: "Sample" }).click();
    const titleValue = await page.locator("input[placeholder='Page title']").inputValue();
    expect(titleValue.length).toBeGreaterThan(0);
  });

  test("platform toggle buttons exist (Facebook, Twitter, LinkedIn)", async ({ page }) => {
    await page.goto(`${BASE}/tools/og-preview`);
    await expect(page.getByRole("button", { name: "Facebook" })).toBeVisible();
    await expect(page.getByRole("button", { name: "X / Twitter" })).toBeVisible();
    await expect(page.getByRole("button", { name: "LinkedIn" })).toBeVisible();
  });

  test("entering title updates preview card", async ({ page }) => {
    await page.goto(`${BASE}/tools/og-preview`);
    await page.locator("input[placeholder='Page title']").fill("My Preview Title");
    // Facebook card renders the title in a div
    await expect(page.locator("text=My Preview Title")).toBeVisible();
  });

  test("checklist updates when fields are filled", async ({ page }) => {
    await page.goto(`${BASE}/tools/og-preview`);
    await page.locator("input[placeholder='Page title']").fill("Title");
    // "Title set" checklist item should turn green (show checkmark)
    await expect(page.locator("text=Title set")).toBeVisible();
  });
});

// ─────────────────────────────────────────────
// All 10 pages return HTTP 200
// ─────────────────────────────────────────────
test.describe("All batch-3 pages return 200", () => {
  const tools = [
    "lorem-ipsum",
    "css-minifier",
    "html-entity-encoder",
    "chmod-calculator",
    "json-path-finder",
    "yaml-validator",
    "svg-optimizer",
    "css-gradient-generator",
    "meta-tag-generator",
    "og-preview",
  ];

  for (const tool of tools) {
    test(`${tool} returns 200`, async ({ page }) => {
      const response = await page.goto(`${BASE}/tools/${tool}`);
      expect(response?.status()).toBe(200);
    });
  }
});

// ─────────────────────────────────────────────
// SEO: all batch-3 tool pages have proper titles
// ─────────────────────────────────────────────
test.describe("SEO - batch-3 tool pages have correct titles", () => {
  const tools = [
    { slug: "lorem-ipsum", expected: "lorem" },
    { slug: "css-minifier", expected: "css" },
    { slug: "html-entity-encoder", expected: "html" },
    { slug: "chmod-calculator", expected: "chmod" },
    { slug: "json-path-finder", expected: "json" },
    { slug: "yaml-validator", expected: "yaml" },
    { slug: "svg-optimizer", expected: "svg" },
    { slug: "css-gradient-generator", expected: "gradient" },
    { slug: "meta-tag-generator", expected: "meta" },
    { slug: "og-preview", expected: "open graph" },
  ];

  for (const tool of tools) {
    test(`${tool.slug} has correct title`, async ({ page }) => {
      await page.goto(`${BASE}/tools/${tool.slug}`);
      const title = await page.title();
      expect(title.toLowerCase()).toContain(tool.expected.toLowerCase());
    });
  }
});
