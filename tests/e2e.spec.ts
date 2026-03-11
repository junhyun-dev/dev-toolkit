import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3099";

test.describe("Homepage", () => {
  test("loads and shows all 7 tools", async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator("h1")).toContainText("Free Developer Tools");
    const toolCards = page.locator('a[href^="/tools/"]');
    expect(await toolCards.count()).toBeGreaterThanOrEqual(7);
  });

  test("privacy banner visible", async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator("text=Your Privacy Matters")).toBeVisible();
  });
});

test.describe("JSON Formatter", () => {
  test("formats valid JSON", async ({ page }) => {
    await page.goto(`${BASE}/tools/json-formatter`);
    await page.locator("textarea").first().fill('{"name":"test","age":20}');
    await page.getByRole("button", { name: "Format (2 spaces)" }).click();
    const output = await page.locator("textarea").nth(1).inputValue();
    expect(output).toContain('"name": "test"');
  });

  test("shows error for invalid JSON", async ({ page }) => {
    await page.goto(`${BASE}/tools/json-formatter`);
    await page.locator("textarea").first().fill('{"broken');
    await page.getByRole("button", { name: "Format (2 spaces)" }).click();
    await expect(page.locator("text=Error:")).toBeVisible();
  });

  test("minify works", async ({ page }) => {
    await page.goto(`${BASE}/tools/json-formatter`);
    await page.locator("textarea").first().fill('{ "a" : 1 , "b" : 2 }');
    await page.getByRole("button", { name: "Minify" }).click();
    const output = await page.locator("textarea").nth(1).inputValue();
    expect(output).toBe('{"a":1,"b":2}');
  });

  test("sample button works", async ({ page }) => {
    await page.goto(`${BASE}/tools/json-formatter`);
    await page.getByRole("button", { name: "Sample" }).click();
    const input = await page.locator("textarea").first().inputValue();
    expect(input.length).toBeGreaterThan(10);
  });
});

test.describe("Diff Checker", () => {
  test("shows differences", async ({ page }) => {
    await page.goto(`${BASE}/tools/diff-checker`);
    await page.locator("textarea").first().fill("hello world");
    await page.locator("textarea").nth(1).fill("hello earth");
    await page.getByRole("button", { name: "Compare" }).click();
    await expect(page.locator("text=added")).toBeVisible();
    await expect(page.locator("text=removed")).toBeVisible();
  });

  test("load sample works", async ({ page }) => {
    await page.goto(`${BASE}/tools/diff-checker`);
    await page.getByRole("button", { name: "Load Sample" }).click();
    const left = await page.locator("textarea").first().inputValue();
    expect(left.length).toBeGreaterThan(10);
  });
});

test.describe("JWT Decoder", () => {
  test("decodes sample JWT", async ({ page }) => {
    await page.goto(`${BASE}/tools/jwt-decoder`);
    await page.getByRole("button", { name: "Sample" }).click();
    await page.getByRole("button", { name: "Decode" }).click();
    await expect(page.getByText("HEADER", { exact: true })).toBeVisible();
    await expect(page.getByText("PAYLOAD", { exact: true })).toBeVisible();
    await expect(page.locator("text=Expired")).toBeVisible();
  });

  test("shows error for invalid JWT", async ({ page }) => {
    await page.goto(`${BASE}/tools/jwt-decoder`);
    await page.locator("textarea").fill("not-a-jwt");
    await page.getByRole("button", { name: "Decode" }).click();
    await expect(page.locator("text=Error:")).toBeVisible();
  });
});

test.describe("Base64 Encoder", () => {
  test("encodes text to base64", async ({ page }) => {
    await page.goto(`${BASE}/tools/base64-encoder`);
    await page.locator("textarea").first().fill("Hello, World!");
    await page.getByRole("button", { name: "Encode to Base64" }).click();
    const output = await page.locator("textarea").nth(1).inputValue();
    expect(output).toBe("SGVsbG8sIFdvcmxkIQ==");
  });

  test("decodes base64 to text", async ({ page }) => {
    await page.goto(`${BASE}/tools/base64-encoder`);
    await page.getByRole("button", { name: "Decode" }).first().click();
    await page.locator("textarea").first().fill("SGVsbG8sIFdvcmxkIQ==");
    await page.getByRole("button", { name: "Decode from Base64" }).click();
    const output = await page.locator("textarea").nth(1).inputValue();
    expect(output).toBe("Hello, World!");
  });

  test("shows error for invalid base64", async ({ page }) => {
    await page.goto(`${BASE}/tools/base64-encoder`);
    await page.getByRole("button", { name: "Decode" }).first().click();
    await page.locator("textarea").first().fill("!!!invalid!!!");
    await page.getByRole("button", { name: "Decode from Base64" }).click();
    await expect(page.locator("text=Error:")).toBeVisible();
  });
});

test.describe("URL Encoder", () => {
  test("encodes URL with special chars", async ({ page }) => {
    await page.goto(`${BASE}/tools/url-encoder`);
    await page.locator("textarea").first().fill("hello world & foo=bar");
    await page.getByRole("button", { name: "Encode (Standard)" }).click();
    const output = await page.locator("textarea").nth(1).inputValue();
    expect(output).toContain("hello%20world");
    expect(output).toContain("%26");
  });

  test("decodes URL encoded string", async ({ page }) => {
    await page.goto(`${BASE}/tools/url-encoder`);
    await page.getByRole("button", { name: "Decode" }).first().click();
    await page.locator("textarea").first().fill("hello%20world%26foo");
    await page.getByRole("button", { name: "Decode URL" }).click();
    const output = await page.locator("textarea").nth(1).inputValue();
    expect(output).toBe("hello world&foo");
  });
});

test.describe("UUID Generator", () => {
  test("generates single UUID", async ({ page }) => {
    await page.goto(`${BASE}/tools/uuid-generator`);
    await page.getByRole("button", { name: "Generate UUID" }).click();
    const uuidText = await page.locator(".font-mono.bg-muted span").first().textContent();
    expect(uuidText?.trim()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  test("generates multiple UUIDs", async ({ page }) => {
    await page.goto(`${BASE}/tools/uuid-generator`);
    await page.locator("select").selectOption("5");
    await page.getByRole("button", { name: "Generate UUIDs" }).click();
    const items = page.locator(".font-mono.bg-muted");
    await expect(items).toHaveCount(5);
  });
});

test.describe("Hash Generator", () => {
  test("generates all hash types", async ({ page }) => {
    await page.goto(`${BASE}/tools/hash-generator`);
    await page.locator("textarea").fill("Hello, World!");
    await page.getByRole("button", { name: "Generate Hashes" }).click();
    await expect(page.getByText("md5", { exact: true })).toBeVisible();
    await expect(page.getByText("sha-1", { exact: true })).toBeVisible();
    await expect(page.getByText("sha-256", { exact: true })).toBeVisible();
    await expect(page.getByText("sha-512", { exact: true })).toBeVisible();
  });

  test("SHA-256 hash is correct", async ({ page }) => {
    await page.goto(`${BASE}/tools/hash-generator`);
    await page.locator("textarea").fill("Hello, World!");
    await page.getByRole("button", { name: "Generate Hashes" }).click();
    // Known SHA-256 of "Hello, World!"
    await expect(
      page.locator("text=dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f")
    ).toBeVisible();
  });
});

test.describe("SEO", () => {
  test("sitemap returns XML", async ({ page }) => {
    const response = await page.goto(`${BASE}/sitemap.xml`);
    expect(response?.status()).toBe(200);
  });

  test("robots.txt returns content", async ({ page }) => {
    const response = await page.goto(`${BASE}/robots.txt`);
    expect(response?.status()).toBe(200);
  });
});
