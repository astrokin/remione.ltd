const linkPattern =
  /https?:\/\/[^\s<>"“”]+|www\.[^\s<>"“”]+|[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi;
const legalHosts = new Set([
  "remione.ltd",
  "www.remione.ltd",
  "iapps.by",
  "www.iapps.by",
  "epopit.app",
  "www.epopit.app",
  "drivingtheorytest.org",
  "www.drivingtheorytest.org",
  "am2.app",
  "pages.flycricket.io",
]);
export function linkTarget(value, legal) {
  if (!/^(https?:\/\/|www\.)/i.test(value))
    return { href: `mailto:${value}`, external: false };
  const url = new URL(value.startsWith("www.") ? `https://${value}` : value);
  if (legal && legalHosts.has(url.hostname)) {
    const leaf = url.pathname.split("/").filter(Boolean).pop() || "";
    if (/privacy/i.test(leaf)) return { href: legal.privacy, external: false };
    if (/terms|conditions|eula/i.test(leaf))
      return { href: legal.terms, external: false };
  }
  if (["remione.ltd", "www.remione.ltd"].includes(url.hostname))
    return { href: url.pathname + url.search + url.hash, external: false };
  return { href: url.href, external: true };
}
export function textLinks(text, legal) {
  const parts = [];
  let offset = 0;
  for (const match of text.matchAll(linkPattern)) {
    let label = match[0].replace(/[.,;:!?]+$/, "");
    for (const [open, close] of [
      ["(", ")"],
      ["[", "]"],
    ])
      while (
        label.endsWith(close) &&
        label.split(close).length > label.split(open).length
      )
        label = label.slice(0, -1);
    if (match.index > offset)
      parts.push({ text: text.slice(offset, match.index) });
    try {
      parts.push({ text: label, ...linkTarget(label, legal) });
    } catch {
      parts.push({ text: label });
    }
    offset = match.index + label.length;
  }
  if (offset < text.length) parts.push({ text: text.slice(offset) });
  return parts;
}
