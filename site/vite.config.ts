import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  // Relative base + hash routing, so the build works from any path (e.g. GitHub Pages).
  base: "./",
  plugins: [react()],
  resolve: {
    // Use the library source directly, so the site never needs a library build.
    alias: { "shape-loaders": fileURLToPath(new URL("../packages/shape-loaders/src/index.ts", import.meta.url)) },
  },
});
