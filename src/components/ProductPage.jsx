import { useState } from "react";
import DevicePreview from "./DevicePreview";
import StoreButtons from "./StoreButtons";
import LinkedText from "./LinkedText";
import { products, shortDescription, platformName } from "../catalog";
import AppCard, { AppIcon } from "./AppCard";
export default function ProductPage({ product }) {
  const [platform, setPlatform] = useState(
    product.listings.find((l) => l.published)?.key || product.listings[0]?.key,
  );
  const listing = product.listings.find((l) => l.key === platform),
    view = listing || product;
  const related = products
    .filter((p) => p.key !== product.key && p.published)
    .sort(
      (a, b) =>
        Number(b.category === product.category) -
        Number(a.category === product.category),
    )
    .slice(0, 3);
  return (
    <>
      <section className="product-hero container">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <a href="/apps">All apps</a>
          <span aria-hidden="true">/</span>
          <span>{product.category}</span>
        </nav>
        <div className="product-intro">
          <div className="product-lead">
            <div className="product-label">
              <AppIcon product={view} />
              <p className="eyebrow">
                {product.category}
                <span>{view.platforms.map(platformName).join(" · ")}</span>
              </p>
            </div>
            <h1>{view.name}</h1>
            <p className="product-teaser">
              {shortDescription(view.description, 230)}
            </p>
            {product.listings.length > 1 && (
              <div
                className="platform-selector"
                role="group"
                aria-label="Choose platform"
              >
                {product.listings.map((l) => (
                  <button
                    aria-pressed={l.key === platform}
                    className={l.key === platform ? "selected" : ""}
                    key={l.key}
                    onClick={() => setPlatform(l.key)}
                  >
                    {l.platforms.map(platformName).join(" & ")}
                  </button>
                ))}
              </div>
            )}
            <div className="product-actions">
              <StoreButtons product={product} />
              <a className="text-link" href="/#contact">
                Get in touch <span aria-hidden="true">→</span>
              </a>
            </div>
            <div className="legal-links" aria-label="App legal documents">
              <a href={product.legal.terms}>Terms & Conditions</a>
              <span aria-hidden="true">·</span>
              <a href={product.legal.privacy}>Privacy Policy</a>
            </div>
          </div>
          <div
            className={`product-preview ${view.platforms.includes("macOS") ? "is-mac" : ""}`}
          >
            {view.screenshots?.length ? (
              <DevicePreview
                platforms={view.platforms}
                src={view.screenshots[0]}
                alt={`${view.name} — ${view.platforms.map(platformName).join(" and ")} preview`}
                priority
              />
            ) : (
              <div className="preview-placeholder">
                <img src={product.icon} alt="" />
                <span>Coming soon</span>
                <p>Your TV. A simpler remote.</p>
                <small>App previews will be available at launch.</small>
              </div>
            )}
          </div>
        </div>
      </section>
      <nav className="product-nav container" aria-label="On this page">
        <a href="#overview">Overview</a>
        <a href="#screenshots">Screenshots</a>
        {product.story.length > 0 && <a href="#story">Product story</a>}
        <a href="#support">Support & legal</a>
      </nav>
      <section id="overview" className="overview-section container">
        <div>
          <p className="eyebrow">A closer look</p>
          <h2>
            Made for your
            <br />
            everyday.
          </h2>
        </div>
        <div className="store-description">
          {view.description
            .split(/\n\s*\n/)
            .filter(Boolean)
            .map((p, i) => (
              <p key={i}>
                <LinkedText legal={product.legal}>{p}</LinkedText>
              </p>
            ))}
        </div>
      </section>
      {product.listings.length > 1 && (
        <noscript>
          <section className="alternate-materials container">
            {product.listings
              .filter((l) => l.key !== platform)
              .map((l) => (
                <article key={l.key}>
                  <h2>
                    {l.name} — {l.platforms.map(platformName).join(" & ")}
                  </h2>
                  {l.description.split(/\n\s*\n/).map((text, i) => (
                    <p key={i}>
                      <LinkedText legal={product.legal}>{text}</LinkedText>
                    </p>
                  ))}
                </article>
              ))}
          </section>
        </noscript>
      )}
      <section id="screenshots" className="screenshots-section">
        <div className="container">
          <div className="section-heading">
            <h2>See it in action.</h2>
            <span className="muted">
              {view.platforms.map(platformName).join(" · ")}
            </span>
          </div>
          <div
            className={`screenshot-gallery ${view.platforms.includes("macOS") ? "mac-gallery" : ""}`}
            tabIndex="0"
            role="region"
            aria-label={`${view.name} screenshots — scroll to see more`}
          >
            {view.screenshots?.length
              ? view.screenshots.map((src, i) => (
                  <DevicePreview
                    platforms={view.platforms}
                    src={src}
                    alt={`${view.name} screenshot ${i + 1}`}
                    key={src}
                  />
                ))
              : [1, 2, 3].map((i) => (
                  <div className="screenshot-placeholder" key={i}>
                    <span aria-hidden="true">◌</span>
                    <p>Preview coming soon</p>
                  </div>
                ))}
          </div>
        </div>
      </section>
      {product.story.length > 0 && (
        <section id="story" className="story-section container">
          <div>
            <p className="eyebrow">Behind the app</p>
            <h2>The product story.</h2>
          </div>
          <div>
            {product.story
              .filter((s) => s.body.length)
              .map((s) => (
                <details key={s.title}>
                  <summary>
                    {s.title}
                    <span aria-hidden="true">+</span>
                  </summary>
                  {s.body.map((p, i) => (
                    <p key={i}>
                      <LinkedText legal={product.legal}>{p}</LinkedText>
                    </p>
                  ))}
                </details>
              ))}
          </div>
        </section>
      )}
      <section id="support" className="support-section container">
        <div>
          <p className="eyebrow">Here to help</p>
          <h2>
            A little support
            <br />
            goes a long way.
          </h2>
          <a className="text-link" href="/#contact">
            Contact us <span aria-hidden="true">→</span>
          </a>
        </div>
        <div>
          <h3>Your app. Your peace of mind.</h3>
          <p>
            Read the terms of use and find out how your information is handled.
          </p>
          <div className="legal-links">
            <a href={product.legal.terms}>Terms & Conditions ↗</a>
            <a href={product.legal.privacy}>Privacy Policy ↗</a>
          </div>
        </div>
      </section>
      <section className="related-section container">
        <div className="section-heading">
          <h2>More from Remione.</h2>
          <a className="text-link" href="/apps">
            All apps →
          </a>
        </div>
        <div className="app-grid">
          {related.map((p) => (
            <AppCard product={p} key={p.key} />
          ))}
        </div>
      </section>
    </>
  );
}
