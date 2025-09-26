import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "es2019",
    sourcemap: false,
    minify: "esbuild",
    rollupOptions: { treeshake: true },
  },
  esbuild: {
    drop: ["console", "debugger"],
  },
});
