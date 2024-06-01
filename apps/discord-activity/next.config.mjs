/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        esmExternals: "loose", // <-- add this
    },
    typescript: {
        // part of lint step, next ignores tsconfig references and breaks trpc
        ignoreBuildErrors: true,
    },
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

export default nextConfig
