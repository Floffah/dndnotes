import { defineConfig } from "tsup";

export default defineConfig([
    {
        name: "backend-framework",
        entry: [
            "./src/shared/index.ts",
            "./src/server/index.ts",
            "./src/client/index.ts",
            // "./src/client/react/context.tsx",
        ],
        target: ["chrome90", "firefox88", "safari14", "edge90", "node18"],
        outDir: "dist",
        bundle: true,
        format: ["cjs", "esm"],
        sourcemap: true,
        dts: true,
    },
]);
