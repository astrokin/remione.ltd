import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { readJSON, root } from "../scripts/io.mjs";
import { textLinks } from "../src/text-links.mjs";
import { devicePresentation } from "../src/device-presentation.mjs";
import { safeJSON } from "../scripts/seo.mjs";
const catalog = await readJSON(".generated/client-catalog.json");
const escape = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
test("source screenshot sizes select classic iPhone, modern iPhone, Android, tablet and Mac frames", () => {
  assert.equal(
    devicePresentation(["iOS"], { width: 392, height: 696 }).shape,
    "classic",
  );
  assert.equal(
    devicePresentation(["iOS"], { width: 221, height: 480 }).shape,
    "modern",
  );
  assert.equal(
    devicePresentation(["Android"], { width: 236, height: 512 }).device,
    "android",
  );
  assert.equal(
    devicePresentation(["iOS", "iPadOS"], { width: 360, height: 480 }).device,
    "ipad",
  );
  assert.equal(
    devicePresentation(["Android"], { width: 384, height: 512 }).device,
    "android-tablet",
  );
  assert.equal(
    devicePresentation(["macOS"], { width: 800, height: 500 }).device,
    "mac",
  );
});
test("description links retain all text, respect URL punctuation, and point legal references to the product", () => {
  const legal = { terms: "/terms-planner", privacy: "/privacy-planner" };
  const text =
    "Privacy: https://am2.app/terms-privacy/post-planner-privacy-policy. Terms: https://am2.app/terms-privacy/post-planner-terms-conditions\nVisit https://example.com/Guide_(app), www.example.org or hello@example.org.";
  const parts = textLinks(text, legal);
  assert.equal(parts.map((p) => p.text).join(""), text);
  assert.deepEqual(
    parts.filter((p) => p.href).map((p) => p.href),
    [
      "/privacy-planner",
      "/terms-planner",
      "https://example.com/Guide_(app)",
      "https://www.example.org/",
      "mailto:hello@example.org",
    ],
  );
  assert.equal(
    textLinks("https://remione.ltd/work/hermes")[0].href,
    "/work/hermes",
  );
  assert.equal(
    textLinks("javascript:alert(1)").some((p) => p.href),
    false,
  );
});
test("every app is pre-rendered with the new layout, readable descriptions, legal links and real download options", async () => {
  for (const product of catalog.products) {
    const html = await readFile(
      `${root}/dist/work/${product.slug}.html`,
      "utf8",
    );
    assert.ok(html.includes('class="product-hero container"'), product.slug);
    assert.ok(
      html.includes("<h1>" + escape(product.name) + "</h1>"),
      product.slug,
    );
    assert.ok(html.includes('class="store-description"'), product.slug);
    assert.ok(html.includes('href="' + product.legal.terms + '"'));
    assert.ok(html.includes('href="' + product.legal.privacy + '"'));
    assert.equal(
      (html.match(/class="store-badge store-badge-/g) || []).length,
      product.listings.filter((l) => l.published).length,
      product.slug,
    );
    const data = JSON.parse(
      html.match(
        /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
      )[1],
    );
    const app = data["@graph"].find(
      (item) => item["@type"] === "SoftwareApplication",
    );
    assert.equal(app.name, product.name);
    assert.deepEqual(app.operatingSystem, product.platforms);
    assert.ok(
      !app.aggregateRating && !app.offers,
      "No invented ratings or prices",
    );
    if (!product.published) assert.equal(app.installUrl, undefined);
  }
});
test("all routes have canonical metadata and parseable Schema.org; all catalog links are crawlable", async () => {
  for (const route of await readJSON(".generated/hosting-routes.json")) {
    const html = await readFile(
      root + "/dist/" + (route === "/" ? "index" : route.slice(1)) + ".html",
      "utf8",
    );
    assert.equal((html.match(/rel="canonical"/g) || []).length, 1, route);
    assert.ok(html.includes(`href="https://remione.ltd${route}"`));
    const data = JSON.parse(
      html.match(
        /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
      )[1],
    );
    assert.equal(data["@context"], "https://schema.org");
    assert.ok(data["@graph"].some((item) => item["@type"] === "WebSite"));
    assert.ok(html.includes('property="og:title"'));
    assert.ok(html.includes('name="twitter:title"'));
  }
  const index = await readFile(root + "/dist/apps.html", "utf8"),
    llms = await readFile(root + "/dist/llms.txt", "utf8");
  for (const p of catalog.products) {
    assert.ok(index.includes(`href="/work/${p.slug}"`));
    assert.ok(llms.includes(`https://remione.ltd/work/${p.slug}`));
  }
  const robots = await readFile(root + "/dist/robots.txt", "utf8");
  assert.ok(robots.includes("User-agent: *\nAllow: /"));
  assert.ok(
    (await readFile(root + "/dist/404.html", "utf8")).includes(
      'name="robots" content="noindex"',
    ),
  );
});
test("structured data serialization cannot terminate the script tag", () => {
  const value = { description: "</script><script>alert(1)</script>\u2028" };
  assert.ok(!safeJSON(value).includes("<"));
  assert.deepEqual(JSON.parse(safeJSON(value)), value);
});
