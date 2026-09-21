export function devicePresentation(platforms, { width, height }) {
  const landscape = width > height;
  const ratio = Math.min(width, height) / Math.max(width, height);
  const tablet = ratio > 0.64;
  const device = platforms.includes("macOS")
    ? "mac"
    : platforms.includes("Android")
      ? tablet
        ? "android-tablet"
        : "android"
      : tablet
        ? "ipad"
        : "iphone";
  const shape =
    device === "mac"
      ? "desktop"
      : tablet
        ? "tablet"
        : device === "iphone" && ratio > 0.52
          ? "classic"
          : "modern";
  return { device, shape, landscape };
}
