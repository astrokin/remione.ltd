import { execFileSync } from "node:child_process";
import { runSync } from "./sync-catalog.mjs";
import { root } from "./io.mjs";
await runSync();
execFileSync("npm", ["run", "build"], { cwd: root, stdio: "inherit" });
execFileSync("npm", ["test"], { cwd: root, stdio: "inherit" });
