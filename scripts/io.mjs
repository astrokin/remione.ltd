import { readFile, writeFile, rename, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
export const root = resolve(import.meta.dirname, "..");
export const readJSON = async (path) =>
  JSON.parse(await readFile(resolve(root, path), "utf8"));
export async function writeJSON(path, value) {
  const target = resolve(root, path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target + ".tmp", JSON.stringify(value, null, 2) + "\n");
  await rename(target + ".tmp", target);
}
export async function retry(fn) {
  let error;
  for (let i = 0; i < 3; i++) {
    try {
      return await fn();
    } catch (e) {
      error = e;
      if (i < 2) await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw error;
}
export async function fetchJSON(url) {
  return retry(async () => {
    const r = await fetch(url, { signal: AbortSignal.timeout(45000) });
    if (!r.ok) throw new Error(`${r.status} ${url}`);
    return r.json();
  });
}
