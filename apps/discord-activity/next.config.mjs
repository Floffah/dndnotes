/** @type {import('next').NextConfig} */
const nextConfig = {
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
