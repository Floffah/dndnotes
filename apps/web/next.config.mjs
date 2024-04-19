import remarkGfm from "remark-gfm";
import createMDX from "@next/mdx"

const withMDX = createMDX({
    options: {
        remarkPlugins: [
            remarkGfm,
        ]
    },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        esmExternals: "loose", // <-- add this
        serverComponentsExternalPackages: ["mongoose"], // <-- and this
    },
    pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
    webpack: (config) => {
        if (!config.resolve) {
            config.resolve = {}
        }

        if (!config.resolve.alias) {
            config.resolve.alias = {}
        }

        config.resolve.alias.hexoid = 'hexoid/dist/index.js'

        return config
    }
};

export default withMDX(nextConfig);
