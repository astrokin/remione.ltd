import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { readJSON, root } from "../scripts/io.mjs";
import {
  buildProducts,
  selectFeatured,
  finishSnapshot,
  reconcileRegistry,
  assertListing,
} from "../catalog/model.mjs";
import { synchronize } from "../scripts/sync-catalog.mjs";
import { normalizeGoogle } from "../scripts/adapters/google.mjs";
import { prepareSite } from "../scripts/site.mjs";
const [registry, snapshot, sources] = await Promise.all(
  [
    "catalog/registry.json",
    "catalog/store-data.json",
    "catalog/sources.json",
  ].map(readJSON),
);
const products = buildProducts(registry, snapshot, sources);
const clone = (value) => structuredClone(value);
test("all listings belong to configured accounts and are represented exactly once", () => {
  const keys = products.flatMap((p) => p.stores);
  assert.equal(keys.length, new Set(keys).size);
  for (const [key, l] of Object.entries(snapshot.listings)) {
    assert.ok(keys.includes(key), key);
    assert.ok(
      sources[l.store].accounts.some((a) => a.id === l.accountId),
      key,
    );
    assertListing(l);
  }
  for (const store of ["apple", "google"])
    for (const account of sources[store].accounts)
      for (const country of sources[store].countries)
        assert.ok(
          snapshot.coverage.some(
            (c) =>
              c.store === store &&
              c.accountId === account.id &&
              c.country === country,
          ),
        );
});
test("four explicit cross-platform pairs; independent Mac and Lite/Pro products", () => {
  for (const [slug, id] of [
    ["pdd-belarus", "by.iapps.pdd.by"],
    ["pdd-kazakhstan", "by.iapps.pdd.kz"],
    ["pdd-ukraine", "by.iapps.pdd.ukr"],
    ["pdd-russia", "by.iapps.pdd.ru"],
  ]) {
    const p = products.find((p) => p.slug === slug);
    assert.equal(p.listings.length, 2);
    assert.ok(p.stores.includes("google:" + id));
    assert.ok(p.platforms.includes("Android"));
  }
  assert.equal(products.filter((p) => p.platforms.includes("macOS")).length, 4);
  assert.notEqual(
    products.find((p) => p.stores.includes("apple:490447524")).slug,
    products.find((p) => p.stores.includes("apple:596040849")).slug,
  );
});
test("store renaming preserves stable route and legal identity", () => {
  const renamed = clone(snapshot);
  renamed.listings["apple:6476892184"].name = "A new title from the store";
  const p = buildProducts(registry, renamed, sources).find(
    (p) => p.key === "drawio-ai-drawing-sketches",
  );
  assert.equal(p.name, "A new title from the store");
  assert.equal(p.slug, "drawio-ai-drawing-sketches");
  assert.equal(p.legal.terms.url, "/terms-drawio");
});
test("featured products require current publication evidence, regardless of configured order", () => {
  const order = ["all-tv-brands-universal-remote", ...registry.featuredOrder];
  assert.equal(
    selectFeatured(products, order, snapshot).key,
    "drawio-ai-drawing-sketches",
  );
  const old = clone(snapshot);
  old.listings["apple:6476892184"].confirmedSync = "old-sync";
  assert.equal(
    selectFeatured(buildProducts(registry, old, sources), order, old).key,
    "epopit",
  );
  for (const l of Object.values(old.listings)) l.published = false;
  assert.equal(
    selectFeatured(buildProducts(registry, old, sources), order, old),
    null,
  );
});
test("pending app has permanent documents, no download, and becomes eligible only after a real release", () => {
  const remote = products.find(
    (p) => p.slug === "all-tv-brands-universal-remote",
  );
  assert.equal(remote.status, "Coming soon");
  assert.equal(remote.published, false);
  assert.equal(remote.legal.privacy.url, "/privacy-tv-remote");
  assert.deepEqual(remote.screenshots, []);
  const released = clone(snapshot);
  released.listings["apple:6758022511"] = {
    ...released.listings["apple:6476892184"],
    key: "apple:6758022511",
    id: "6758022511",
    name: "Released remote",
    confirmedSync: released.syncId,
  };
  assert.equal(
    selectFeatured(
      buildProducts(registry, released, sources),
      [remote.key],
      released,
    ).name,
    "Released remote",
  );
});
test("explicit exclusions purge even old caches and cannot create routes or featured products", () => {
  const dirty = clone(snapshot),
    r = clone(registry);
  dirty.listings["apple:1540103598"] = {
    ...snapshot.listings["apple:6476892184"],
    key: "apple:1540103598",
    id: "1540103598",
  };
  r.products.push({
    key: "sold",
    slug: "smart-photo-cleaner",
    stores: ["apple:1540103598"],
  });
  const saved = finishSnapshot(dirty, dirty.listings, sources, "new", []);
  assert.equal(saved.listings["apple:1540103598"], undefined);
  assert.ok(!buildProducts(r, dirty, sources).some((p) => p.key === "sold"));
  assert.ok(
    !reconcileRegistry(r, dirty.listings, sources).products.some(
      (p) => p.key === "sold",
    ),
  );
});
test("new applications get ID-based identities and require an explicit legal assignment", () => {
  const l = {
    ...snapshot.listings["apple:6476892184"],
    key: "apple:9999",
    id: "9999",
  };
  const r = reconcileRegistry(registry, { "apple:9999": l }, sources);
  const p = r.products.find((p) => p.stores.includes("apple:9999"));
  assert.equal(p.slug, "apple-app-9999");
  assert.equal(p.legal, null);
});
test("failed store or image synchronization preserves the previous snapshot", async () => {
  const before = JSON.stringify(snapshot),
    empty = async () => ({ listings: {}, coverage: [] });
  await assert.rejects(
    synchronize({
      sources,
      registry,
      previous: snapshot,
      apple: async () => {
        throw Error("store unavailable");
      },
      google: empty,
      assets: async () => {
        throw Error("must not run");
      },
    }),
    /store unavailable/,
  );
  const apple = async () => ({
    listings: clone(snapshot.listings),
    coverage: [],
  });
  await assert.rejects(
    synchronize({
      sources,
      registry,
      previous: snapshot,
      apple,
      google: empty,
      assets: async () => {
        throw Error("image download failed");
      },
    }),
    /image download failed/,
  );
  assert.equal(JSON.stringify(snapshot), before);
});
test("repeated complete synchronization keeps identities, pairs, legal assignments and source data", async () => {
  const apple = async () => ({
      listings: clone(snapshot.listings),
      coverage: clone(snapshot.coverage),
    }),
    google = async () => ({ listings: {}, coverage: [] }),
    assets = async () => ({});
  const a = await synchronize({
    sources,
    registry,
    previous: snapshot,
    apple,
    google,
    assets,
  });
  const b = await synchronize({
    sources,
    registry: a.registry,
    previous: a.snapshot,
    apple,
    google,
    assets,
  });
  assert.deepEqual(a.registry, b.registry);
  assert.deepEqual(
    Object.keys(a.snapshot.listings),
    Object.keys(b.snapshot.listings),
  );
  assert.notEqual(a.snapshot.syncId, b.snapshot.syncId);
});
test("Google publisher mismatch and malformed metadata are rejected", () => {
  assert.throws(
    () =>
      normalizeGoogle(
        { appId: "test", developerId: "someone-else" },
        sources.google.accounts[0],
        "us",
      ),
    /publisher mismatch/,
  );
  assert.throws(() => assertListing({ key: "broken" }), /missing id/);
});
test("copied legal texts are immutable and all direct pages exist", async () => {
  for (const source of await readJSON("catalog/legal-sources.json")) {
    const b = await readFile(root + "/" + source.file);
    assert.equal(
      createHash("sha256").update(b).digest("hex"),
      source.sha256,
      source.file,
    );
  }
  const site = await prepareSite();
  assert.equal(Object.keys(site.legalPages).length, products.length * 2);
  for (const p of products) {
    assert.ok(site.legalPages[p.legal.terms.url]);
    assert.ok(site.legalPages[p.legal.privacy.url]);
    assert.ok(site.routes.includes("/work/" + p.slug));
  }
  for (const route of sources.removedRoutes)
    assert.ok(!site.routes.includes(route));
});
test("built public files contain no excluded product; every declared route is a physical page", async () => {
  const banned =
    /smart[\s-]*(?:photo[\s-]*)?cleaner|1540103598|terms-cleaner|privacy-cleaner/i;
  async function scan(folder) {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      assert.ok(!banned.test(entry.name), entry.name);
      const file = folder + "/" + entry.name;
      if (entry.isDirectory()) await scan(file);
      else if (/\.(js|html|xml|json|css|txt|svg)$/.test(file))
        assert.ok(!banned.test(await readFile(file, "utf8")), file);
    }
  }
  await scan(root + "/dist");
  for (const route of await readJSON(".generated/hosting-routes.json"))
    assert.ok(
      (
        await readFile(
          root +
            "/dist/" +
            (route === "/" ? "index" : route.slice(1)) +
            ".html",
          "utf8",
        )
      ).startsWith("<!doctype html>"),
    );
  const firebase = await readJSON("firebase.json");
  assert.ok(!firebase.hosting.rewrites?.some((r) => r.source === "**"));
  assert.deepEqual(firebase.hosting.predeploy, ["npm run release:prepare"]);
});

test("missing legal assignment or source file blocks publication with a product-specific report", async () => {
  const missing = clone(registry);
  missing.products.find((p) => p.slug === "pdd-belarus").legal.privacy = null;
  await assert.rejects(
    prepareSite({ registry: missing }),
    /Publication blocked:[\s\S]*pdd-belarus: missing privacy/,
  );
  const absent = clone(registry);
  absent.products.find((p) => p.slug === "pdd-belarus").legal.terms.file =
    "src/legal/nonexistent.txt";
  await assert.rejects(
    prepareSite({ registry: absent }),
    /pdd-belarus: terms.*ENOENT/,
  );
});
