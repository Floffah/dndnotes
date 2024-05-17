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
    },
]);

// const commonOptions = {
//     bundle: true,
//     format: ["cjs", "esm"],
//     sourcemap: true,
//     splitting: false,
//     dts: true,
//     target: ["chrome90", "firefox88", "safari14", "edge90", "node18"],
// } satisfies Options;
//
// export default defineConfig([
//     {
//         ...commonOptions,
//         entry: ["./src/shared/index.ts", "./src/client/index.ts"],
//         outDir: "dist",
//     },
//     {
//         ...commonOptions,
//         entry: ["./src/server/index.ts"],
//         outDir: "dist/server",
//         esbuildOptions: (opts) => {
//             opts.banner = {
//                 js: '"use server";',
//             };
//         },
//     },
//     {
//         ...commonOptions,
//         entry: ["./src/react/index.ts"],
//         outDir: "dist/react",
//         esbuildOptions: (opts) => {
//             opts.banner = {
//                 js: '"use client";',
//             };
//         },
//     },
// ]);
