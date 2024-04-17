import { Options, defineConfig } from "tsup";

const commonOptions: Options = {
    target: ["chrome90", "firefox88", "safari14", "edge90", "node18"],
    bundle: true,
    format: ["cjs", "esm"],
    dts: true,
    clean: false,
    sourcemap: true,
};

export default defineConfig([
    {
        ...commonOptions,
        name: "components-client",
        outDir: "dist/client",
        entry: ["./src/client/index.ts"],
        esbuildOptions: (opts) => {
            opts.banner = {
                js: '"use client";',
            };
        },
    },
    {
        ...commonOptions,
        name: "components-server",
        outDir: "dist/server",
        entry: ["./src/server/index.ts"],
        esbuildOptions: (opts) => {
            opts.banner = {
                js: '"use server";',
            };
        },
    },
]);
