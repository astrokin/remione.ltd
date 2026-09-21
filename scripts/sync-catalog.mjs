import { randomUUID } from "node:crypto";
import { unlink } from "node:fs/promises";
import { resolve } from "node:path";
import { root, readJSON, writeJSON } from "./io.mjs";
import { collectApple } from "./adapters/apple.mjs";
import { collectGoogle } from "./adapters/google.mjs";
import { saveAssets } from "./assets.mjs";
import {
  assertListing,
  finishSnapshot,
  reconcileRegistry,
} from "../catalog/model.mjs";
export async function synchronize({
  sources,
  registry,
  previous,
  apple = collectApple,
  google = collectGoogle,
  assets = saveAssets,
  log = () => {},
}) {
  const knownKeys = [
    ...new Set([
      ...registry.products.flatMap((p) => p.stores),
      ...Object.keys(previous?.listings || {}),
    ]),
  ].filter((key) => !sources.excludedStoreKeys.includes(key));
  const results = await Promise.allSettled([
    apple(sources.apple, sources.excludedStoreKeys, log, knownKeys),
    google(sources.google, sources.excludedStoreKeys, log, knownKeys),
  ]);
  const errors = results
    .filter((r) => r.status === "rejected")
    .map((r) => r.reason.message);
  if (errors.length) throw new Error(errors.join("\n"));
  const listings = Object.assign({}, ...results.map((r) => r.value.listings));
  for (const key of sources.excludedStoreKeys) delete listings[key];
  for (const listing of Object.values(listings)) assertListing(listing);
  const cache = await assets(listings, log);
  const snapshot = finishSnapshot(
    previous,
    listings,
    sources,
    randomUUID(),
    results.flatMap((r) => r.value.coverage),
  );
  return {
    snapshot,
    registry: reconcileRegistry(registry, listings, sources),
    cache,
  };
}
export async function runSync() {
  const sources = await readJSON("catalog/sources.json"),
    registry = await readJSON("catalog/registry.json");
  let previous;
  try {
    previous = await readJSON("catalog/store-data.json");
  } catch {}
  // Explicit removals apply even if this attempt subsequently fails.
  if (previous) {
    const keptAssets = new Set(
      Object.entries(previous.listings)
        .filter(([key]) => !sources.excludedStoreKeys.includes(key))
        .flatMap(([, listing]) => [listing.icon, ...listing.screenshots]),
    );
    for (const key of sources.excludedStoreKeys) {
      const removed = previous.listings[key];
      if (removed)
        for (const asset of [removed.icon, ...removed.screenshots]) {
          if (
            !keptAssets.has(asset) &&
            /^\/store-assets\/[a-f0-9]{64}\.(png|jpg|webp)$/.test(asset)
          ) {
            await unlink(resolve(root, "public" + asset)).catch((error) => {
              if (error.code !== "ENOENT") throw error;
            });
          }
        }
      delete previous.listings[key];
    }
    await writeJSON("catalog/store-data.json", previous);
  }
  try {
    const result = await synchronize({
      sources,
      registry,
      previous,
      log: console.log,
    });
    await writeJSON("catalog/asset-cache.json", result.cache);
    await writeJSON("catalog/registry.json", result.registry);
    await writeJSON("catalog/store-data.json", result.snapshot);
    await writeJSON("catalog/sync-report.json", {
      status: "complete",
      syncId: result.snapshot.syncId,
      completedAt: result.snapshot.completedAt,
      coverage: result.snapshot.coverage,
      listings: Object.keys(result.snapshot.listings).length,
      missingLegal: result.registry.products
        .filter((p) => !p.legal)
        .map((p) => p.slug),
    });
    console.log(
      `Saved ${Object.keys(result.snapshot.listings).length} store listings / ${result.registry.products.length} products.`,
    );
  } catch (error) {
    await writeJSON("catalog/sync-report.json", {
      status: "failed",
      attemptedAt: new Date().toISOString(),
      errors: [error.message],
      retainedSync: previous?.syncId || null,
    });
    throw error;
  }
}
if (process.argv[1] === import.meta.filename)
  runSync().catch((error) => {
    console.error(
      "Sync failed; previous successful catalog retained.\n" + error.message,
    );
    process.exitCode = 1;
  });
