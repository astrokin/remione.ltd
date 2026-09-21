import { fetchJSON } from "../io.mjs";
export function normalizeApple(app, country) {
  const mac = app.kind === "mac-software";
  return {
    key: `apple:${app.trackId}`,
    store: "apple",
    id: String(app.trackId),
    accountId: String(app.artistId),
    publisher: app.artistName,
    name: app.trackName,
    description: app.description,
    icon: app.artworkUrl512 || app.artworkUrl100,
    screenshots: [
      ...new Set([
        ...(app.screenshotUrls || []),
        ...(app.ipadScreenshotUrls || []),
      ]),
    ],
    platforms: mac
      ? ["macOS"]
      : [
          ...(app.screenshotUrls?.length ? ["iOS"] : []),
          ...(app.ipadScreenshotUrls?.length ? ["iPadOS"] : []),
        ],
    categories: app.genres || [],
    url: app.trackViewUrl,
    country,
    availableCountries: [country],
    language: app.languageCodesISO2A?.includes("EN") ? "en" : "original",
    bundleId: app.bundleId,
  };
}
export async function collectApple(
  config,
  excluded,
  log = () => {},
  knownKeys = [],
) {
  const listings = {},
    coverage = [];
  const ids = config.accounts.map((a) => a.id).join(",");
  for (const country of config.countries) {
    log(`Apple ${country.toUpperCase()}`);
    const data = await fetchJSON(
      `https://itunes.apple.com/lookup?id=${ids}&entity=software&country=${country}&lang=en_us&limit=200`,
    );
    if (
      !Array.isArray(data.results) ||
      data.resultCount !== data.results.length
    )
      throw new Error(`Invalid Apple response: ${country}`);
    for (const account of config.accounts) {
      if (
        !data.results.some(
          (a) =>
            String(a.artistId) === account.id && a.wrapperType === "artist",
        )
      )
        throw new Error(`Apple account ${account.id} missing in ${country}`);
      const apps = data.results.filter(
        (a) => a.trackId && String(a.artistId) === account.id,
      );
      if (!apps.length || apps.length >= 200)
        throw new Error(
          `Incomplete Apple account ${account.id} in ${country}: ${apps.length}`,
        );
      coverage.push({
        store: "apple",
        accountId: account.id,
        country,
        count: apps.length,
      });
      for (const app of apps) {
        const key = `apple:${app.trackId}`;
        if (excluded.includes(key)) continue;
        if (!["software", "mac-software"].includes(app.kind))
          throw new Error(`Unexpected Apple kind ${app.kind}`);
        const old = listings[key],
          next = normalizeApple(app, country);
        if (!old) listings[key] = next;
        else {
          const countries = [...new Set([...old.availableCountries, country])];
          if (
            country === account.preferredCountry ||
            (old.language !== "en" && next.language === "en")
          )
            listings[key] = next;
          listings[key].availableCountries = countries;
        }
      }
    }
    // Stay below the public Lookup API rate limit.
    await new Promise((r) => setTimeout(r, 3200));
  }
  // Verify previously known IDs separately: a partial developer list must not
  // silently unpublish a still-live app. Ownership is checked again on every match.
  const missing = knownKeys.filter(
    (key) =>
      key.startsWith("apple:") &&
      !listings[key] &&
      !config.pending.some((p) => key === `apple:${p.id}`),
  );
  for (const country of config.countries) {
    if (!missing.length) break;
    const data = await fetchJSON(
      `https://itunes.apple.com/lookup?id=${missing.map((key) => key.split(":")[1]).join(",")}&country=${country}&lang=en_us`,
    );
    if (
      !Array.isArray(data.results) ||
      data.resultCount !== data.results.length
    )
      throw new Error(`Invalid Apple verification: ${country}`);
    for (const app of data.results) {
      if (!app.trackId) continue;
      const key = `apple:${app.trackId}`;
      if (!config.accounts.some((a) => a.id === String(app.artistId))) continue;
      if (!listings[key]) listings[key] = normalizeApple(app, country);
    }
    await new Promise((r) => setTimeout(r, 3200));
  }
  for (const pending of config.pending) {
    if (
      listings[`apple:${pending.id}`] ||
      excluded.includes(`apple:${pending.id}`)
    )
      continue;
    const data = await fetchJSON(
      `https://itunes.apple.com/lookup?id=${pending.id}&country=us&lang=en_us`,
    );
    if (!Array.isArray(data.results))
      throw new Error(`Invalid pending Apple response: ${pending.id}`);
    const app = data.results.find((a) => String(a.trackId) === pending.id);
    if (app) {
      if (!pending.accountIds.includes(String(app.artistId)))
        throw new Error(`Publisher mismatch: ${pending.id}`);
      listings[`apple:${pending.id}`] = normalizeApple(app, "us");
    }
  }
  return { listings, coverage };
}
