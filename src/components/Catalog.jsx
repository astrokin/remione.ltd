import { useEffect, useState } from "react";
import {
  products,
  homeProducts,
  availableCategories,
  slugifyCategory,
} from "../catalog";
import AppCard from "./AppCard";
function currentCategory(search) {
  const query = new URLSearchParams(search).get("category");
  return (
    availableCategories.find((c) => slugifyCategory(c) === query) || "All apps"
  );
}
export default function Catalog({ home = false, initialSearch = "" }) {
  const [category, setCategory] = useState(() =>
      home ? "All apps" : currentCategory(initialSearch),
    ),
    [limit, setLimit] = useState(home ? 6 : 12);
  useEffect(() => {
    const back = () => {
      setCategory(home ? "All apps" : currentCategory(window.location.search));
      setLimit(home ? 6 : 12);
    };
    back();
    window.addEventListener("popstate", back);
    return () => window.removeEventListener("popstate", back);
  }, [home]);
  const filtered = (home ? homeProducts : products).filter(
    (p) => category === "All apps" || p.category === category,
  );
  function select(value) {
    setCategory(value);
    setLimit(home ? 6 : 12);
    if (!home) {
      const url = new URL(window.location);
      if (value === "All apps") url.searchParams.delete("category");
      else url.searchParams.set("category", slugifyCategory(value));
      window.history.pushState({}, "", url);
    }
  }
  return (
    <section
      className={`catalog-section container ${home ? "home-catalog" : ""}`}
      id={home ? "work" : undefined}
      aria-label="App catalog"
    >
      {home ? (
        <div className="section-heading">
          <h2>Find your next app.</h2>
          <a className="text-link" href="/apps">
            View all apps <span aria-hidden="true">→</span>
          </a>
        </div>
      ) : (
        <div className="catalog-intro">
          <p className="eyebrow">The Remione collection</p>
          <h1>
            A little app.
            <br />A world of possibilities.
          </h1>
          <p>
            Tools to learn, create, unwind, and make every day a little easier.
          </p>
        </div>
      )}
      <div className="category-row" role="group" aria-label="App categories">
        {availableCategories.map((c) => (
          <button
            type="button"
            aria-pressed={category === c}
            className={`category ${category === c ? "active" : ""}`}
            onClick={() => select(c)}
            key={c}
          >
            {c}
          </button>
        ))}
      </div>
      {!home && (
        <p className="catalog-count" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "app" : "apps"}
          {category !== "All apps" ? ` in ${category}` : ""}
        </p>
      )}
      <div className="app-grid">
        {filtered.slice(0, limit).map((p) => (
          <AppCard product={p} key={p.key} />
        ))}
      </div>
      {!home && (
        <noscript>
          <section className="no-script-directory">
            <h2>Browse every app</h2>
            <ul>
              {products.map((p) => (
                <li key={p.key}>
                  <a href={`/work/${p.slug}`}>{p.name}</a>
                </li>
              ))}
            </ul>
          </section>
        </noscript>
      )}
      <div className="catalog-action">
        {home ? (
          <a
            className="button secondary"
            href={
              category === "All apps"
                ? "/apps"
                : `/apps?category=${slugifyCategory(category)}`
            }
          >
            Explore the full collection <span aria-hidden="true">→</span>
          </a>
        ) : limit < filtered.length ? (
          <button
            className="button secondary"
            onClick={() => setLimit((n) => n + 12)}
          >
            Show more{" "}
            <span className="more-count">{filtered.length - limit}</span>
          </button>
        ) : (
          <p className="muted">
            You’ve seen the whole collection
            {category === "All apps" ? "." : " in this category."}
          </p>
        )}
      </div>
    </section>
  );
}
