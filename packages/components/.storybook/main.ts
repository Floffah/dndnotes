import { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
    framework: "@storybook/nextjs",
    stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],

    addons: [
        "@storybook/addon-essentials",
        "@storybook/addon-links",
        "@chromatic-com/storybook",
        "@storybook/addon-coverage",
        "@storybook/addon-interactions",
        "@storybook/addon-onboarding",
    ],
    docs: {
        docsMode: false,
        defaultName: "Documentation",
    },
};

export default config;
