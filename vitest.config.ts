import { defineConfig } from "vitest/config";

// A standalone config so Vitest doesn't load the Cloudflare/Vite build plugins,
// which aren't needed (and don't work) in a plain Node test context.
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
