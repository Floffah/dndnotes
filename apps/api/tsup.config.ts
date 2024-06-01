import { defineConfig } from "tsup";

export default defineConfig([
    {
        name: "server",
        entry: ["./src/index.ts", "./src/appRouter.ts"],
        target: ["chrome90", "firefox88", "safari14", "edge90", "node18"],
        outDir: "dist",
        bundle: true,
        format: ["cjs", "esm"],
        clean: false,
        sourcemap: true,
        dts: true,
        external: ["next"],
    },
]);
