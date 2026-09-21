import { shortDescription, pageTitle } from "../src/page-meta.mjs";
const origin = "https://remione.ltd";
export const safeJSON = (value) =>
  JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
const applicationCategories = {
  "Driving & Tests": "EducationalApplication",
  Education: "EducationalApplication",
  Creativity: "DesignApplication",
  Productivity: "ProductivityApplication",
  Entertainment: "EntertainmentApplication",
  Utilities: "UtilitiesApplication",
  Other: "Application",
};
export function structuredData(site, path) {
  const product = site.products.find((p) => path === "/work/" + p.slug);
  const legalProduct = site.products.find((p) =>
    Object.values(p.legal).some((doc) => doc.url === path),
  );
  const org = {
    "@type": "Organization",
    "@id": origin + "/#organization",
    name: "Remione LTD",
    url: origin + "/",
    email: "info@remione.ltd",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Limassol",
      addressCountry: "CY",
    },
  };
  const website = {
    "@type": "WebSite",
    "@id": origin + "/#website",
    url: origin + "/",
    name: "Remione",
    publisher: { "@id": org["@id"] },
    inLanguage: "en",
  };
  const page = {
    "@type": path === "/apps" ? "CollectionPage" : "WebPage",
    "@id": origin + path + "#webpage",
    url: origin + path,
    name: legalProduct
      ? `${path.startsWith("/terms-") ? "Terms & Conditions" : "Privacy Policy"} · ${legalProduct.name}`
      : pageTitle(path, product),
    isPartOf: { "@id": website["@id"] },
    inLanguage: "en",
  };
  const graph = [org, website, page];
  if (product) {
    const live = product.listings.filter((l) => l.published);
    const software = {
      "@type": "SoftwareApplication",
      "@id": origin + path + "#app",
      name: product.name,
      url: origin + path,
      description: product.description,
      applicationCategory:
        applicationCategories[product.category] || "Application",
      operatingSystem: product.platforms,
      image: origin + product.icon,
      screenshot: product.screenshots.map((src) => ({
        "@type": "ImageObject",
        url: origin + src,
        ...site.client.imageInfo[src],
      })),
      creativeWorkStatus: product.published ? "Published" : "In development",
    };
    if (live.length) {
      software.installUrl = live.map((l) => l.url);
      software.sameAs = live.map((l) => l.url);
      software.publisher = { "@type": "Organization", name: live[0].publisher };
    }
    page.mainEntity = { "@id": software["@id"] };
    graph.push(software);
    graph.push({
      "@type": "BreadcrumbList",
      "@id": origin + path + "#breadcrumb",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Apps",
          item: origin + "/apps",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: product.name,
          item: origin + path,
        },
      ],
    });
    page.breadcrumb = { "@id": origin + path + "#breadcrumb" };
  } else if (path === "/apps") {
    graph.push({
      "@type": "ItemList",
      "@id": origin + "/apps#collection",
      numberOfItems: site.products.length,
      itemListElement: site.products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: p.name,
        url: origin + "/work/" + p.slug,
      })),
    });
    page.mainEntity = { "@id": origin + "/apps#collection" };
  } else if (legalProduct) {
    page.about = { "@id": origin + "/work/" + legalProduct.slug + "#app" };
  }
  return { "@context": "https://schema.org", "@graph": graph };
}
export function llmIndex(site) {
  return (
    "# Remione\n\n> Remione LTD is an independent app design and development studio in Limassol, Cyprus. This site brings together its app portfolio across iPhone, iPad, Android and Mac.\n\nThe product pages contain store descriptions, platform availability, screenshots and stable local Terms and Privacy documents. Coming soon products have no download links.\n\n## Main pages\n\n- [App catalog](https://remione.ltd/apps)\n- [About Remione](https://remione.ltd/#about)\n- [Contact](https://remione.ltd/#contact)\n- [Sitemap](https://remione.ltd/sitemap.xml)\n\n## Apps\n\n" +
    site.products
      .map(
        (p) =>
          `- [${p.name.replace(/[\[\]\n]/g, " ")}](${origin}/work/${p.slug}): ${p.platforms.join(", ")}. ${p.status}. ${shortDescription(p.description, 170)} [Terms](${origin}${p.legal.terms.url}) · [Privacy](${origin}${p.legal.privacy.url})`,
      )
      .join("\n") +
    "\n"
  );
}
