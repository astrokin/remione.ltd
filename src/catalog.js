import catalog from "../.generated/client-catalog.json";
export const products = catalog.products;
export const imageInfo = catalog.imageInfo;
export const featured =
  products.find((p) => p.key === catalog.featuredKey) || null;
export const homeProducts = [
  ...catalog.homeOrder
    .map((key) => products.find((p) => p.key === key))
    .filter(Boolean),
  ...products.filter((p) => !catalog.homeOrder.includes(p.key)),
];
export const categoryNames = [
  "All apps",
  "Driving & Tests",
  "Education",
  "Creativity",
  "Productivity",
  "Entertainment",
  "Utilities",
  "Other",
];
export const slugifyCategory = (name) =>
  name.toLowerCase().replace(/ & /g, "-").replace(/\s+/g, "-");
export const availableCategories = categoryNames.filter(
  (name) => name === "All apps" || products.some((p) => p.category === name),
);
export function shortDescription(text, max = 125) {
  const first = text
    .split(/\n\s*\n/)[0]
    .replace(/\s+/g, " ")
    .trim();
  return first.length > max
    ? first.slice(0, max).replace(/\s\S*$/, "") + "…"
    : first;
}
export function platformName(platform) {
  return (
    { iOS: "iPhone", iPadOS: "iPad", macOS: "Mac", Android: "Android" }[
      platform
    ] || platform
  );
}
