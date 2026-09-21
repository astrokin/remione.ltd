import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { readJSON, writeJSON, root } from "./io.mjs";

const origin = new URL(process.argv[2] || "https://remione.ltd").origin;
assert.ok(
  origin === "https://remione.ltd" ||
    /^http:\/\/(?:127\.0\.0\.1|localhost):\d+$/.test(origin),
  "Verify only production or a local Hosting emulator",
);
const routes = await readJSON(".generated/hosting-routes.json");
const assets = new Set();
const failures = [];
const forbidden = /smart[ -](?:photo[ -])?cleaner|1540103598/i;

async function check(path, expectedStatus, expectedBytes) {
  let error;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const response = await fetch(origin + path, {
        redirect: "manual",
        headers: { "Cache-Control": "no-cache" },
        signal: AbortSignal.timeout(30000),
      });
      assert.equal(response.status, expectedStatus, path + " HTTP status");
      const bytes = Buffer.from(await response.arrayBuffer());
      if (expectedBytes) {
        assert.ok(bytes.equals(expectedBytes), path + " differs from the built release");
      }
      if ((response.headers.get("content-type") || "").includes("text/")) {
        assert.ok(!forbidden.test(bytes.toString()), path + " contains an excluded product");
      }
      return bytes.toString();
    } catch (e) {
      error = e;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 2000 * (attempt + 1)));
    }
  }
  throw error;
}

async function batch(items, task) {
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(8, items.length) }, async () => {
    while (next < items.length) {
      const item = items[next++];
      try { await task(item); }
      catch (e) { failures.push({ path: item, error: e.message }); }
    }
  }));
}

await batch(routes, async (route) => {
  const path = route === "/" ? "/index" : route;
  const expected = await readFile(root + "/dist" + path + ".html");
  const html = await check(route, 200, expected);
  for (const match of html.matchAll(/(?:src|href)="(\/(?:assets|store-assets|store-badges)\/[^"?#]+|\/legal\.css)"/g)) {
    assets.add(match[1]);
  }
});
await batch([...assets], async (path) => {
  await check(path, 200, await readFile(root + "/dist" + path));
});
await batch(["/sitemap.xml", "/robots.txt", "/llms.txt"], async (path) => {
  await check(path, 200, await readFile(root + "/dist" + path));
});
const removed = [
  "/work/smart-photo-cleaner", "/terms-cleaner", "/privacy-cleaner",
  "/work/nonexistent-release-check", "/nonexistent-release-check",
];
await batch(removed, (path) => check(path, 404));
const report = {
  origin, checkedAt: new Date().toISOString(),
  commit: process.env.GITHUB_SHA || null,
  routes: routes.length, assets: assets.size, removedOrUnknown: removed.length,
  failures,
};
await writeJSON(".generated/release-verification.json", report);
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
