export const categories = [
  "All apps",
  "Driving & Tests",
  "Education",
  "Creativity",
  "Productivity",
  "Entertainment",
  "Utilities",
  "Other",
];
export const categorySlug = (name) =>
  name.toLowerCase().replace(/ & /g, "-").replace(/\s+/g, "-");
export function allowedProduct(product, sources) {
  return (
    !sources.excludedSlugs.includes(product.slug) &&
    !product.stores.some((key) => sources.excludedStoreKeys.includes(key))
  );
}
export function normalizeCategory(listing) {
  const category = (listing.categories || []).join(" ").toLowerCase();
  if (/education|reference/.test(category)) return "Education";
  if (/graphic|design|photo|art/.test(category)) return "Creativity";
  if (/productivity|business/.test(category)) return "Productivity";
  if (/entertainment|game/.test(category)) return "Entertainment";
  if (/utilit|tools/.test(category)) return "Utilities";
  return "Other";
}
export function buildProducts(registry, snapshot, sources) {
  return registry.products
    .filter((p) => allowedProduct(p, sources))
    .map((product) => {
      const listings = product.stores
        .filter((key) => !sources.excludedStoreKeys.includes(key))
        .map((key) => snapshot.listings[key])
        .filter(Boolean)
        .map((listing) => ({
          ...listing,
          published: Boolean(
            listing.published &&
              snapshot.status === "complete" &&
              listing.confirmedSync === snapshot.syncId,
          ),
        }));
      const live = listings.filter(
        (l) =>
          l.published &&
          snapshot.status === "complete" &&
          l.confirmedSync === snapshot.syncId,
      );
      const primary = live[0] || listings[0] || product.comingSoon;
      if (!primary) return null;
      return {
        ...product,
        name: primary.name,
        description: primary.description,
        icon: primary.icon,
        screenshots: primary.screenshots || [],
        platforms: [
          ...new Set(
            (live.length ? live : listings)
              .flatMap((l) => l.platforms)
              .concat(
                !listings.length ? product.comingSoon?.platforms || [] : [],
              ),
          ),
        ],
        category: categories.includes(product.category)
          ? product.category
          : normalizeCategory(primary),
        listings,
        published: live.length > 0,
        status: live.length
          ? "Published"
          : product.comingSoon && !listings.length
            ? "Coming soon"
            : "Currently unavailable",
      };
    })
    .filter(Boolean);
}
export function selectFeatured(products, order, snapshot) {
  return (
    order
      .map((key) => products.find((p) => p.key === key))
      .find(
        (p) =>
          p?.published &&
          p.listings.some(
            (l) => l.published && l.confirmedSync === snapshot.syncId,
          ),
      ) || null
  );
}
export function reconcileRegistry(registry, listings, sources) {
  const products = registry.products.filter((p) => allowedProduct(p, sources));
  const owned = new Set(products.flatMap((p) => p.stores));
  for (const [key, listing] of Object.entries(listings)) {
    if (sources.excludedStoreKeys.includes(key) || owned.has(key)) continue;
    // IDs, not names, determine identity. New products need a deliberate legal assignment.
    const slug = `${listing.store}-app-${listing.id}`;
    products.push({
      key: slug,
      slug,
      category: normalizeCategory(listing),
      stores: [key],
      legal: null,
    });
  }
  return { ...registry, products };
}
export function assertListing(listing) {
  for (const field of ["id", "accountId", "name", "description", "icon", "url"])
    if (!listing[field]) throw new Error(`${listing.key}: missing ${field}`);
  if (!listing.platforms?.length || !listing.screenshots?.length)
    throw new Error(`${listing.key}: missing platforms or screenshots`);
}
export function finishSnapshot(previous, current, sources, syncId, coverage) {
  const listings = {};
  for (const [key, listing] of Object.entries(previous?.listings || {})) {
    if (!sources.excludedStoreKeys.includes(key))
      listings[key] = { ...listing, published: false };
  }
  for (const [key, listing] of Object.entries(current)) {
    if (!sources.excludedStoreKeys.includes(key))
      listings[key] = { ...listing, published: true, confirmedSync: syncId };
  }
  return {
    version: 1,
    status: "complete",
    syncId,
    completedAt: new Date().toISOString(),
    coverage,
    listings,
  };
}
