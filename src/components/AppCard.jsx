import DevicePreview from "./DevicePreview";
import { shortDescription, platformName } from "../catalog";
export function AppIcon({ product, className = "" }) {
  return (
    <img
      className={`app-icon ${className}`}
      src={product.icon}
      alt=""
      loading="lazy"
      width="56"
      height="56"
    />
  );
}
export function AppArtwork({ product, priority = false }) {
  const screenshots = product.screenshots?.slice(0, 2) || [];
  return (
    <div
      className={`app-artwork tone-${product.category.toLowerCase().split(" ")[0]} ${product.platforms.includes("macOS") ? "mac-artwork" : ""}`}
      aria-hidden="true"
    >
      {screenshots.length ? (
        screenshots.map((src, i) => (
          <DevicePreview
            platforms={
              product.listings.find((l) => l.published)?.platforms ||
              product.platforms
            }
            className={`art-device art-device-${i}`}
            src={src}
            alt=""
            priority={priority}
            key={src}
          />
        ))
      ) : (
        <div className="coming-art">
          <img src={product.icon} alt="" />
          <span>Something useful is on its way.</span>
        </div>
      )}
    </div>
  );
}
export default function AppCard({ product }) {
  return (
    <a className="app-card" href={`/work/${product.slug}`}>
      <AppArtwork product={product} />
      <div className="card-heading">
        <AppIcon product={product} />
        <div>
          <p className="eyebrow">{product.category}</p>
          <h3>{product.name}</h3>
        </div>
        <span className="card-arrow" aria-hidden="true">
          ↗
        </span>
      </div>
      <p className="card-description">
        {shortDescription(product.description)}
      </p>
      <div className="card-platforms">
        {product.platforms.map(platformName).join(" · ")}
        {!product.published && (
          <span className="status-badge">{product.status}</span>
        )}
      </div>
    </a>
  );
}
