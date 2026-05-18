/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/2048-hexagon/",
  plugins: [react()],
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
