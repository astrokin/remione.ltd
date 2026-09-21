# Remione LTD

React/Vite app library, deployed manually to Firebase Hosting. The contact form, Firebase project configuration, Analytics and Firestore security rules are preserved.

## Local development and verification

Use Node 22 or 24 (Firebase CLI supported versions).

```sh
npm ci
npm run dev
npm run build
npm test
npm run preview
```

Development and ordinary builds use the committed catalog and local images. They make no store API requests. The first build must run before `npm test`, which also checks the public output. Vite and Firebase Hosting serve unknown product/legal URLs as 404; legal pages work without JavaScript.

For Hosting-level HTTP checks:

```sh
npx firebase emulators:start --only hosting --project demo-remione-local
```

## Catalog maintenance

- `catalog/sources.json`: developer accounts, storefront countries, pending release IDs and permanent exclusions.
- `catalog/store-data.json`: last complete store snapshot, publication evidence, metadata and local asset paths.
- `catalog/registry.json`: permanent product keys/slugs, explicit platform pairings, categories, legal file/URL assignments, `featuredOrder` and `homeOrder`.
- `catalog/editorial.json`: preserved product, market, growth and investment copy. Store imports never edit it.
- `catalog/legal-sources.json`: original sources and SHA-256 of the copied legal documents.
- `src/legal/`: permanent local legal text; store sync never writes this directory.
- `public/store-assets/`: downloaded images named by SHA-256 of their bytes.
- `catalog/asset-cache.json`: source URL → local hash file provenance. It is not a runtime network cache.
- `catalog/sync-report.json`: latest successful coverage or failed attempt report.

```sh
npm run catalog:sync
```

Apple Lookup scans US, GB, FM and the regional driving-app markets, retaining each ID once and verifying the developer. Mac products remain separate. Google Play uses its own `google-play-scraper` adapter with developer ID verification and English requests. English storefront metadata is preferred where available; store-provided original text is retained otherwise. Previously known missing IDs are checked separately. A parser, account, network or image failure aborts the sync; the previous complete snapshot and its assets remain available. Explicitly excluded products are always removed, including from old snapshots, generated routes and output assets.

New IDs create separate ID-based registry entries with **no legal assignment**. Assign a stable slug, category and applicable local Terms/Privacy before building for publication. Only explicitly paired IDs share a product; title similarity never merges Lite, Pro or Mac versions. Existing slugs survive name changes. For a new driving product, assign the Driving & Tests category explicitly.

Every product requires its own permanent Terms and Privacy URLs. Document files may share the publisher's applicable source text, but URLs remain product-specific. Copy documents deliberately, record their source and hash, and preserve their wording. Missing or empty documents stop the build with a list of affected products. HTML document sources must be sanitized, trusted static content. No placeholder legal text is generated.

`featuredOrder` is a list of product keys, initially beginning with Drawio. Only listings confirmed published by the current successful snapshot qualify. Invalid, unpublished and unavailable entries are skipped; the block hides when no configured candidate qualifies. Universal Remote keeps its original page and legal URLs, with Coming soon and no active store button until a successful import confirms its release.

After syncing during development, restart Vite (or run a build) to regenerate the local view data. Commit the registry, store snapshot, source documents and content-addressed assets together.

## Build and routes

Each build generates `.generated/hosting-routes.json`, `.generated/client-catalog.json`, the sitemap, a physical HTML page for every allowed route and `404.html`. Firebase clean URLs map directly to those files; there is no catch-all rewrite to the homepage. Legal HTML is independent of React, store APIs and JavaScript. Non-current cached store assets are removed from `dist`.

## Publication — separate approval required

No deployment is automatic. After explicit approval:

```sh
npm run deploy
npm run release:verify
```

Firebase Hosting's predeploy hook runs `npm run release:prepare`: a fresh store sync, a validated build and all tests. Partial sync, missing legal content or failed tests exit nonzero and prevent a new deployment, including when using the normal Firebase CLI command directly. The already published site remains intact. The deploy command publishes Hosting only; existing Firestore rules and data stay in place. No database migration is performed.

After deployment, `npm run release:verify` compares every live page and its referenced assets with the built release, checks sitemap/robots/llms, and verifies removed and unknown routes return 404. It makes only read requests and never submits the contact form. A mismatch returns a failure for investigation; it does not automatically roll back an already published release. The report is saved to `.generated/release-verification.json`. For a local Hosting emulator, use `npm run release:verify -- http://127.0.0.1:5002`.

The public Google Play page format can change. The isolated adapter fails closed and reports the affected source instead of silently publishing an incomplete catalog. Update and verify it before retrying a failed release.

## Presentation, SEO and AI discovery

Screenshots keep their original width/height ratio. A shared `DevicePreview` wraps them in an iPhone, Android phone, tablet or Mac frame based on their platform and measured image size. A 9:16 iPhone image uses a classic iPhone frame; taller images use a modern frame. Original store images are never stretched or rewritten. Build-time dimensions also reserve image space before loading.

All published platform badges remain visible while the platform selector changes the description and screenshots. Badge artwork is stored locally from Apple's official marketing guidelines and Google Play's badge resources. URLs and email addresses in descriptions are clickable; app-specific legal references resolve to that product's local Terms/Privacy pages.

Every build pre-renders the same React components used in the browser to full static HTML through Vite's SSR loader, then hydrates them in the browser. Product descriptions, download links, headings and legal links are available without executing JavaScript. The catalog includes a no-JavaScript directory for all apps, and multi-platform product pages include alternate platform text for readers without JavaScript. This runs only during the build and requires no server backend or database migration.

Generated pages include canonical URLs, unique metadata, Open Graph/Twitter previews, and Schema.org Organization, WebSite, WebPage/CollectionPage, SoftwareApplication, BreadcrumbList and ItemList data. No prices or ratings are invented. `/robots.txt` permits crawling; `/sitemap.xml` covers current routes; `/llms.txt` provides a supplementary plain-text index with product and legal links. It is a convenience index, not a guarantee or requirement for AI search inclusion.

References: [Google JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics), [Google AI features guidance](https://developers.google.com/search/docs/appearance/ai-features), [Schema.org SoftwareApplication](https://schema.org/SoftwareApplication). Search indexing, rich-result eligibility and AI citations remain controlled by their providers and should be checked on the deployed URLs after release.
