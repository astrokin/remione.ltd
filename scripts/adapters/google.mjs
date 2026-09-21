import gplay from "google-play-scraper";
import { retry } from "../io.mjs";
export function normalizeGoogle(app, account, country) {
  const developerId = app.developerUrl
    ? new URL(app.developerUrl).searchParams.get("id")
    : String(app.developerInternalID || "");
  if (String(app.developerId) !== account.id && developerId !== account.id)
    throw new Error(`Google publisher mismatch: ${app.appId}`);
  if (app.available === false || app.preregister)
    throw new Error(`Google app is not published: ${app.appId}`);
  return {
    key: `google:${app.appId}`,
    store: "google",
    id: app.appId,
    accountId: account.id,
    publisher: app.developer,
    name: app.title,
    description: app.description,
    icon: app.icon,
    screenshots: app.screenshots || [],
    platforms: ["Android"],
    categories: [app.genre],
    url: app.url,
    country,
    availableCountries: [country],
    language: "en",
    privacySource: app.privacyPolicy,
  };
}
export async function collectGoogle(
  config,
  excluded,
  log = () => {},
  knownKeys = [],
) {
  const listings = {},
    coverage = [];
  for (const account of config.accounts)
    for (const country of config.countries) {
      log(`Google Play ${country.toUpperCase()}`);
      const apps = await retry(() =>
        gplay.developer({
          devId: account.id,
          lang: "en",
          country,
          num: 1000,
          fullDetail: false,
          throttle: 2,
          requestOptions: { timeout: 45000 },
        }),
      );
      if (!Array.isArray(apps) || !apps.length || apps.length >= 1000)
        throw new Error(
          `Incomplete Google developer response: ${account.id}/${country}`,
        );
      coverage.push({
        store: "google",
        accountId: account.id,
        country,
        count: apps.length,
      });
      for (const item of apps) {
        const key = `google:${item.appId}`;
        if (excluded.includes(key)) continue;
        if (listings[key]) {
          listings[key].availableCountries.push(country);
          continue;
        }
        const app = await retry(() =>
          gplay.app({
            appId: item.appId,
            lang: "en",
            country,
            throttle: 2,
            requestOptions: { timeout: 45000 },
          }),
        );
        listings[key] = normalizeGoogle(app, account, country);
      }
    }
  // A known app missing from a developer page needs an explicit store check.
  for (const key of knownKeys.filter(
    (key) => key.startsWith("google:") && !listings[key],
  )) {
    const appId = key.slice(7);
    for (const country of config.countries) {
      let app;
      try {
        app = await retry(() =>
          gplay.app({
            appId,
            lang: "en",
            country,
            throttle: 2,
            requestOptions: { timeout: 45000 },
          }),
        );
      } catch (error) {
        if (error.status === 404 || error.statusCode === 404) continue;
        throw error;
      }
      const account = config.accounts.find(
        (a) =>
          a.id === String(app.developerId) ||
          a.id === String(app.developerInternalID),
      );
      if (account && !app.preregister && app.available !== false) {
        listings[key] = normalizeGoogle(app, account, country);
        break;
      }
    }
  }
  return { listings, coverage };
}
