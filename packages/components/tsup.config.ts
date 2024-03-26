import { defineConfig } from "tsup";

export default defineConfig({
    name: "components",
    outDir: "dist",
    entry: ["./src/index.ts"],
    target: ["chrome90", "firefox88", "safari14", "edge90", "node18"],
    bundle: true,
    format: ["cjs", "esm"],
    dts: true,
    clean: false,
    sourcemap: true,
    esbuildOptions: (opts) => {
        opts.banner = {
            js: '"use client";',
        };
        // all components are clients. server components in almost any case should be in the frontend project, if one neds to be here then a separate bundle will be created
    },
});
