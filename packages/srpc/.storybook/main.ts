import { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
    framework: "@storybook/nextjs",
    stories: ["../**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],

    addons: ["@storybook/addon-essentials", "@storybook/addon-links"],
    docs: {
        docsMode: true,
        defaultName: "Documentation",
    },
    refs: (config, { configType }) => ({
        components: {
            title: "Component Library",
            url:
                configType === "DEVELOPMENT"
                    ? "http://localhost:6006/"
                    : "https://components.dndnotes.app",
        },
    }),
};

export default config;
