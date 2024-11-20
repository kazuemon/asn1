import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/index.ts"],
  clean: true,
  format: ["cjs", "esm"],
  minify: false,
  dts: true,
  outDir: "./dist",
  treeshake: true,
});
