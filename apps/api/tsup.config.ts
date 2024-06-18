import { defineConfig } from "tsup";

export default defineConfig({
    name: "models",
    outDir: "dist",
    entry: ["./src/index.ts"],
    target: ["chrome90", "firefox88", "safari14", "edge90", "node18"],
    bundle: true,
    format: ["cjs", "esm"],
    dts: false,
    clean: false,
    sourcemap: true,
});
