import { defineConfig, createServer } from "vite";
import react from "@vitejs/plugin-react";
import { prepareSite, buildPages, routeMiddleware } from "./scripts/site.mjs";
export default defineConfig(async () => {
  const site = await prepareSite();
  return {
    plugins: [
      react(),
      {
        name: "catalog-pages",
        configureServer(server) {
          server.middlewares.use(routeMiddleware(site));
        },
        configurePreviewServer(server) {
          server.middlewares.use(routeMiddleware(site, true));
        },
        generateBundle(_options, bundle) {
          const analytics = Object.values(bundle).find(
            (item) =>
              item.type === "chunk" &&
              item.facadeModuleId?.endsWith("/src/firebase.js"),
          );
          if (!analytics)
            throw new Error(
              "Firebase Analytics entry is missing from the build.",
            );
          site.analyticsPath = "/" + analytics.fileName;
        },
        async closeBundle() {
          if (!site.analyticsPath) return;
          const renderer = await createServer({
            configFile: false,
            root: process.cwd(),
            cacheDir: ".generated/ssr-cache",
            appType: "custom",
            mode: "production",
            plugins: [react()],
            server: { middlewareMode: true, hmr: false, watch: null },
            optimizeDeps: { noDiscovery: true, include: [] },
            logLevel: "error",
          });
          try {
            const { render } = await renderer.ssrLoadModule(
              "/src/entry-server.jsx",
            );
            await buildPages(site, render);
          } finally {
            await renderer.close();
          }
        },
      },
    ],
  };
});
