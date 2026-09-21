export function shortDescription(text, max = 160) {
  const normalized = text.replace(/\s+/g, " ").trim();
  return normalized.length > max
    ? normalized.slice(0, max - 1).replace(/\s\S*$/, "") + "…"
    : normalized;
}
export function pageTitle(path, product) {
  return product
    ? `${product.name} — Remione`
    : path === "/apps"
      ? "All apps for iPhone, Android & Mac — Remione"
      : path === "/"
        ? "Remione — Small apps. Everyday possibilities."
        : "Page not found — Remione";
}
