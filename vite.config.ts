/// <reference types="vitest" />
import { existsSync } from "node:fs";
import { resolve, sep } from "node:path";
import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import pkg from "./package.json";

const staticPages = (): Plugin => ({
  name: "static-pages",
  configureServer(server) {
    const publicDir = resolve(__dirname, "public");
    server.middlewares.use((req, _res, next) => {
      const path = req.url?.split("?")[0] ?? "";
      if (path.endsWith("/") && path !== "/" && !path.includes("..")) {
        const file = resolve(publicDir, `.${path}index.html`);
        if (file.startsWith(publicDir + sep) && existsSync(file)) {
          req.url = `${path}index.html`;
        }
      }
      next();
    });
  },
});

export default defineConfig({
  base: "/",
  plugins: [react(), staticPages()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  server: { port: 3000, open: true },
  build: { outDir: "dist", sourcemap: false },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
    css: {
      modules: { classNameStrategy: "non-scoped" },
    },
  },
});
