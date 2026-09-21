const badgeFor = (listing) =>
  listing.store === "google"
    ? {
        file: "google-play.png",
        label: "Get it on Google Play",
        kind: "google",
      }
    : listing.platforms.includes("macOS")
      ? {
          file: "mac-app-store.svg",
          label: "Download on the Mac App Store",
          kind: "mac",
        }
      : {
          file: "app-store.svg",
          label: "Download on the App Store",
          kind: "apple",
        };
export default function StoreButtons({ product }) {
  const live = product.listings.filter((listing) => listing.published);
  if (!live.length)
    return <span className="release-label">{product.status}</span>;
  return (
    <div className="store-buttons" aria-label="Download options">
      {live.map((listing) => {
        const badge = badgeFor(listing);
        return (
          <a
            className={`store-badge store-badge-${badge.kind}`}
            key={listing.key}
            href={listing.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={badge.label}
          >
            <img
              src={`/store-badges/${badge.file}`}
              alt={badge.label}
              width={
                badge.kind === "google" ? 646 : badge.kind === "mac" ? 156 : 120
              }
              height={badge.kind === "google" ? 250 : 40}
            />
          </a>
        );
      })}
    </div>
  );
}
