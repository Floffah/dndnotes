import { Options, defineConfig } from "tsup";

export default defineConfig([
    {
        name: "backend-framework",
        entry: [
            "./src/shared/index.ts",
            "./src/server/index.ts",
            "./src/client/index.ts",
            "./src/react/index.ts",
        ],
        target: ["chrome90", "firefox88", "safari14", "edge90", "node18"],
        outDir: "dist",
        bundle: true,
        format: ["cjs", "esm"],
        sourcemap: true,
        splitting: true,
        dts: true,
        noExternal: ["nanoid"],
    },
]);