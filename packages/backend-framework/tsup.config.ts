import { defineConfig } from "tsup";

export default defineConfig([
    {
        name: "backend-framework",
        entry: ["./src/shared/index.ts", "./src/server/index.ts"],
        target: ["chrome90", "firefox88", "safari14", "edge90", "node18"],
        outDir: "dist",
        bundle: true,
        format: ["cjs", "esm"],
        sourcemap: true,
        dts: true,
    },
    {
        name: "backend-framework-client",
        entry: ["./src/client/index.ts"],
        target: ["chrome90", "firefox88", "safari14", "edge90", "node18"],
        outDir: "dist",
        bundle: true,
        format: ["cjs", "esm"],
        sourcemap: true,
        dts: true,
        esbuildOptions: (options) => {
            options.banner = {
                js: '"use client";',
            };
        },
    },
]);
