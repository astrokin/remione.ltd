import { useEffect } from "react";
import { pageTitle } from "./page-meta.mjs";
import DevicePreview from "./components/DevicePreview";
import { featured, products, shortDescription } from "./catalog";
import Catalog from "./components/Catalog";
import Contact from "./components/Contact";
import ProductPage from "./components/ProductPage";
function Header() {
  return (
    <header className="site-header container">
      <a className="wordmark" href="/" aria-label="Remione home">
        remione<span>.</span>
      </a>
      <nav aria-label="Main navigation">
        <a href="/apps">Apps</a>
        <a href="/#about">About</a>
        <a href="/#contact">Contact</a>
      </nav>
    </header>
  );
}
function Footer() {
  return (
    <footer className="site-footer container">
      <div>
        <a className="wordmark" href="/">
          remione<span>.</span>
        </a>
        <p>Remione LTD · Limassol, Cyprus</p>
      </div>
      <nav aria-label="Footer navigation">
        <a href="/apps">Apps</a>
        <a href="/#about">About</a>
        <a href="/#contact">Contact</a>
      </nav>
    </footer>
  );
}
function Home() {
  return (
    <>
      <div className={`home-spotlight ${featured ? "" : "no-feature"}`}>
        <section className="home-hero container">
          <div>
            <p className="eyebrow">Independent apps. Thoughtfully made.</p>
            <h1>
              Small apps.
              <br />
              Everyday possibilities.
            </h1>
            <p className="hero-description">
              Useful apps for all the things you love to do.
            </p>
            <a className="button" href="/#work">
              Explore our apps <span aria-hidden="true">→</span>
            </a>
            <p className="hero-platforms">
              iPhone & iPad <span>·</span> Android <span>·</span> Mac
            </p>
          </div>
        </section>
        {featured && (
          <>
            <section className="featured-band">
              <div className="container">
                <div className="featured-copy">
                  <p className="eyebrow">
                    In the spotlight <span aria-hidden="true">↗</span>
                  </p>
                  <h2>{featured.name}</h2>
                  <p>{shortDescription(featured.description, 135)}</p>
                  <a className="text-link" href={`/work/${featured.slug}`}>
                    Explore app <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </section>
            <a
              href={`/work/${featured.slug}`}
              className="featured-visual"
              aria-label={`Explore ${featured.name}`}
            >
              {featured.screenshots.slice(0, 2).map((src, i) => (
                <DevicePreview
                  platforms={
                    featured.listings.find((l) => l.published)?.platforms ||
                    featured.platforms
                  }
                  src={src}
                  alt={`${featured.name} preview ${i + 1}`}
                  key={src}
                  className={`featured-device featured-device-${i}`}
                  priority
                />
              ))}
            </a>
          </>
        )}
      </div>
      <Catalog home />
      <div className="studio-contact container">
        <section id="about" className="about-section">
          <p className="eyebrow">The studio</p>
          <h2>
            Made with care.
            <br />
            Built in Cyprus.
          </h2>
          <p>
            We’re an independent app design and development studio based in
            Limassol. For over a decade, we’ve been turning everyday ideas into
            useful apps.
          </p>
          <p>
            From learning something new to finding a creative moment, our
            growing collection is made to fit into your life.
          </p>
          <a className="text-link" href="mailto:info@remione.ltd">
            Get to know us <span aria-hidden="true">↗</span>
          </a>
        </section>
        <Contact />
      </div>
    </>
  );
}
function NotFound() {
  return (
    <section className="not-found container">
      <p className="eyebrow">404</p>
      <h1>This page isn’t here.</h1>
      <p>Find something useful in our app collection.</p>
      <a className="button" href="/apps">
        Explore apps →
      </a>
    </section>
  );
}
export default function App({ pathname = "/", initialSearch = "" }) {
  const path = decodeURIComponent(pathname).replace(/\/$/, "") || "/",
    product = products.find((p) => path === `/work/${p.slug}`);
  useEffect(() => {
    document.title = pageTitle(path, product);
    if (window.location.hash) {
      requestAnimationFrame(() =>
        document
          .getElementById(window.location.hash.slice(1))
          ?.scrollIntoView(),
      );
    }
  }, [path, product]);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main">
        {product ? (
          <ProductPage product={product} />
        ) : path === "/apps" ? (
          <Catalog initialSearch={initialSearch} />
        ) : path === "/" ? (
          <Home />
        ) : (
          <NotFound />
        )}
      </main>
      <Footer />
    </>
  );
}
