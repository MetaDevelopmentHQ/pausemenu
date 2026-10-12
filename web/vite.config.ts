import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  base: "./", // required for FiveM
  // the browser preview imports ../locales/*.json
  server: { fs: { allow: [".."] } },
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "esbuild",
    target: "chrome103", // FiveM CEF version
  },
});
