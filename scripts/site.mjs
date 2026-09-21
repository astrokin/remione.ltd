import { readFile, writeFile, mkdir, readdir, unlink } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { root, readJSON, writeJSON } from "./io.mjs";
import { imageSize } from "image-size";
import { structuredData, safeJSON, llmIndex } from "./seo.mjs";
import { shortDescription, pageTitle } from "../src/page-meta.mjs";
import { buildProducts, selectFeatured } from "../catalog/model.mjs";
export const escapeHTML = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const e = escapeHTML;
export const excerpt = (text) =>
  text
    .replace(/\s+/g, " ")
    .slice(0, 160)
    .replace(/\s\S*$/, "") + "…";
export function staticPage(title, body, path, noindex = false) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(title)} — Remione</title><meta name="description" content="${e(title)}"><link rel="canonical" href="https://remione.ltd${e(path)}"><link rel="icon" href="/assets/favicon.svg">${noindex ? '<meta name="robots" content="noindex">' : ""}<link rel="stylesheet" href="/legal.css"></head><body><header><a class="brand" href="/">remione<span>.</span></a><nav><a href="/apps">Apps</a><a href="/#about">About</a><a href="/#contact">Contact</a></nav></header><main>${body}</main><footer>Remione LTD · Limassol, Cyprus <a href="mailto:info@remione.ltd">info@remione.ltd</a></footer></body></html>`;
}
export const notFoundHTML = () =>
  staticPage(
    "Page not found",
    '<div class="not-found"><p>404</p><h1>This page isn’t here.</h1><p>Explore our apps or head back home.</p><a href="/apps">Explore apps →</a> <a href="/">Home</a></div>',
    "/404",
    true,
  );
export async function prepareSite({ registry: registryOverride } = {}) {
  const [savedRegistry, snapshot, sources, editorial] = await Promise.all(
    [
      "catalog/registry.json",
      "catalog/store-data.json",
      "catalog/sources.json",
      "catalog/editorial.json",
    ].map(readJSON),
  );
  const registry = registryOverride || savedRegistry;
  if (snapshot.status !== "complete" || !snapshot.syncId)
    throw Error(
      "A complete saved catalog is required. Run npm run catalog:sync.",
    );
  const products = buildProducts(registry, snapshot, sources),
    errors = [],
    legalPages = {};
  const unique = new Set(["/", "/apps"]);
  for (const p of products) {
    const route = "/work/" + p.slug;
    if (unique.has(route)) errors.push(`Duplicate route: ${route}`);
    unique.add(route);
    for (const type of ["terms", "privacy"]) {
      const doc = p.legal?.[type];
      if (!doc?.file || !/^\/[a-z0-9-]+$/.test(doc.url)) {
        errors.push(`${p.slug}: missing ${type}`);
        continue;
      }
      if (unique.has(doc.url)) errors.push(`Duplicate legal route: ${doc.url}`);
      unique.add(doc.url);
      try {
        const text = await readFile(resolve(root, doc.file), "utf8");
        if (text.trim().length < 100) throw Error("empty document");
        const body = doc.file.endsWith(".html")
          ? text
          : text
              .trim()
              .split(/\n\s*\n/)
              .map((block) => `<p>${e(block)}</p>`)
              .join("\n");
        const title =
          type === "terms" ? "Terms & Conditions" : "Privacy Policy";
        legalPages[doc.url] = staticPage(
          `${title} · ${p.name}`,
          `<a class="back" href="${route}">← ${e(p.name)}</a><h1>${title}</h1><div class="legal-body">${body}</div>`,
          doc.url,
        );
      } catch (error) {
        errors.push(`${p.slug}: ${type} (${error.message})`);
      }
    }
    for (const listing of p.listings)
      for (const asset of [listing.icon, ...listing.screenshots]) {
        if (!/^\/store-assets\/[a-f0-9]{64}\.(png|jpg|webp)$/.test(asset))
          errors.push(`${p.slug}: non-local image ${asset}`);
        else
          try {
            await readFile(resolve(root, "public" + asset));
          } catch {
            errors.push(`${p.slug}: missing image ${asset}`);
          }
      }
  }
  if (errors.length)
    throw new Error("Publication blocked:\n" + errors.join("\n"));
  const featured = selectFeatured(products, registry.featuredOrder, snapshot);
  const clientProducts = products.map((p) => ({
    ...p,
    legal: { terms: p.legal.terms.url, privacy: p.legal.privacy.url },
    story: editorial[p.slug] || [],
  }));
  const imageInfo = {};
  const assets = [
    ...new Set(
      products.flatMap((p) => [
        p.icon,
        ...p.listings.flatMap((l) => [l.icon, ...l.screenshots]),
      ]),
    ),
  ];
  await Promise.all(
    assets.map(async (asset) => {
      const { width, height } = imageSize(
        await readFile(resolve(root, "public" + asset)),
      );
      imageInfo[asset] = { width, height };
    }),
  );
  const client = {
    imageInfo,
    products: clientProducts,
    featuredKey: featured?.key || null,
    homeOrder: registry.homeOrder,
    syncId: snapshot.syncId,
    completedAt: snapshot.completedAt,
  };
  await writeJSON(".generated/client-catalog.json", client);
  const routes = [...unique].sort();
  await writeJSON(".generated/hosting-routes.json", routes);
  return { client, products, routes, legalPages };
}
function pageMeta(template, site, path, product) {
  const legalProduct = site.products.find((p) =>
    Object.values(p.legal).some((doc) => doc.url === path),
  );
  const title = legalProduct
    ? `${path.startsWith("/terms-") ? "Terms & Conditions" : "Privacy Policy"} · ${legalProduct.name} — Remione`
    : pageTitle(path, product);
  const description = legalProduct
    ? `${path.startsWith("/terms-") ? "Terms of use" : "Privacy policy"} for ${legalProduct.name}. Read the complete document and find support for this app on Remione.`
    : product
      ? shortDescription(product.description)
      : "Explore apps for iPhone, iPad, Android and Mac. Learn, create and make everyday tasks easier with the Remione app collection.";
  const icon =
    product?.icon ||
    legalProduct?.icon ||
    site.products.find((p) => p.key === site.client.featuredKey)?.icon;
  let html = template
    .replace(/<title>[^<]*<\/title>/, () => `<title>${e(title)}</title>`)
    .replace(
      /<meta name="description" content="[^"]*"\s*\/?>/,
      () => `<meta name="description" content="${e(description)}">`,
    )
    .replace(
      /<link rel="canonical" href="[^"]*"\s*\/?>/,
      () => `<link rel="canonical" href="https://remione.ltd${e(path)}">`,
    );
  const tags = `<meta name="robots" content="index, follow, max-image-preview:large"><meta property="og:site_name" content="Remione"><meta property="og:title" content="${e(title)}"><meta property="og:description" content="${e(description)}"><meta property="og:url" content="https://remione.ltd${e(path)}">${icon ? `<meta property="og:image" content="https://remione.ltd${e(icon)}"><meta property="og:image:alt" content="${e(product?.name || legalProduct?.name || "Remione apps")}">` : ""}<meta name="twitter:title" content="${e(title)}"><meta name="twitter:description" content="${e(description)}">${icon ? `<meta name="twitter:image" content="https://remione.ltd${e(icon)}">` : ""}<script type="application/ld+json">${safeJSON(structuredData(site, path))}</script>`;
  return html.replace("</head>", tags + "</head>");
}
export const withAnalytics = (html, script) =>
  html.replace(
    "</body>",
    `<script type="module" src="${script}"></script></body>`,
  );
export async function buildPages(site, render) {
  const dist = resolve(root, "dist"),
    template = await readFile(resolve(dist, "index.html"), "utf8");
  for (const route of site.routes) {
    const p = site.products.find((p) => "/work/" + p.slug === route);
    let html = pageMeta(site.legalPages[route] || template, site, route, p);
    if (!site.legalPages[route]) {
      html = html.replace(
        '<div id="root"></div>',
        () => `<div id="root">${render(route)}</div>`,
      );
    }
    const file = resolve(
      dist,
      route === "/" ? "index.html" : route.slice(1) + ".html",
    );
    await mkdir(dirname(file), { recursive: true });
    await writeFile(
      file,
      site.legalPages[route] ? withAnalytics(html, site.analyticsPath) : html,
    );
  }
  await writeFile(
    resolve(dist, "404.html"),
    withAnalytics(notFoundHTML(), site.analyticsPath),
  );
  await writeFile(
    resolve(dist, "sitemap.xml"),
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      site.routes
        .map((p) => `<url><loc>https://remione.ltd${e(p)}</loc></url>`)
        .join("\n") +
      "\n</urlset>\n",
  );
  await writeFile(resolve(dist, "llms.txt"), llmIndex(site));
  await writeFile(
    resolve(dist, "robots.txt"),
    "User-agent: *\nAllow: /\n\nSitemap: https://remione.ltd/sitemap.xml\n",
  );
  // The output only contains assets referenced by the current, filtered catalog.
  const used = new Set(
    site.products
      .flatMap((p) => p.listings.flatMap((l) => [l.icon, ...l.screenshots]))
      .map((p) => p.split("/").pop()),
  );
  for (const filename of await readdir(resolve(dist, "store-assets")))
    if (!used.has(filename))
      await unlink(resolve(dist, "store-assets", filename));
}
export function routeMiddleware(site, preview = false) {
  return (req, res, next) => {
    let path;
    try {
      path =
        decodeURIComponent(
          new URL(req.url, "http://localhost").pathname,
        ).replace(/\/$/, "") || "/";
    } catch {
      res.statusCode = 400;
      res.end("Bad request");
      return;
    }
    if (site.legalPages[path]) {
      if (preview) return next();
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end(withAnalytics(site.legalPages[path], "/src/firebase.js"));
      return;
    }
    if (
      site.routes.includes(path) ||
      /^\/(?:@|src\/|node_modules\/|catalog\/|\.generated\/|assets\/|store-assets\/|store-badges\/|fonts\/)/.test(
        path,
      ) ||
      [
        "/legal.css",
        "/robots.txt",
        "/sitemap.xml",
        "/llms.txt",
        "/favicon.ico",
      ].includes(path)
    )
      return next();
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(
      preview
        ? notFoundHTML()
        : withAnalytics(notFoundHTML(), "/src/firebase.js"),
    );
  };
}
