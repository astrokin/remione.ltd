import { createHash } from "node:crypto";
import { writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { root, retry } from "./io.mjs";
export async function saveAssets(listings, log = () => {}) {
  const folder = resolve(root, "public/store-assets");
  await mkdir(folder, { recursive: true });
  const usedCache = {},
    jobs = new Map();
  async function download(url) {
    if (jobs.has(url)) return jobs.get(url);
    const promise = (async () => {
      if (
        !/^https:\/\/(?:[^/]+\.)?(?:mzstatic\.com|googleusercontent\.com)\//.test(
          url,
        )
      )
        throw new Error(`Unexpected image origin: ${url}`);
      // Revalidate remote bytes on every successful sync; filenames depend on content, not URL.
      const buffer = await retry(async () => {
        const r = await fetch(url, { signal: AbortSignal.timeout(60000) });
        if (!r.ok) throw new Error(`Image ${r.status}: ${url}`);
        const b = Buffer.from(await r.arrayBuffer());
        if (!r.headers.get("content-type")?.startsWith("image/"))
          throw new Error(`Not an image: ${url}`);
        return b;
      });
      let ext =
        buffer[0] === 0x89
          ? "png"
          : buffer[0] === 0xff
            ? "jpg"
            : buffer.toString("ascii", 8, 12) === "WEBP"
              ? "webp"
              : null;
      if (!ext) throw new Error(`Unsupported image data: ${url}`);
      const name =
        createHash("sha256").update(buffer).digest("hex") + "." + ext;
      await writeFile(resolve(folder, name), buffer);
      const path = "/store-assets/" + name;
      usedCache[url] = path;
      return path;
    })();
    jobs.set(url, promise);
    return promise;
  }
  for (const l of Object.values(listings)) {
    log(`Images: ${l.name}`);
    l.icon = await download(l.icon);
    const saved = [];
    for (let i = 0; i < l.screenshots.length; i += 4)
      saved.push(
        ...(await Promise.all(l.screenshots.slice(i, i + 4).map(download))),
      );
    l.screenshots = saved;
  }
  return usedCache;
}
