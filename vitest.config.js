import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    setupFiles: ["./src/test/setup.js"],
  },
  define: {
    "import.meta.env.VITE_OWM_KEY": JSON.stringify("test-api-key"),
  },
});
