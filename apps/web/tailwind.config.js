/** @type {import('tailwindcss').Config} */
module.exports = {
    content: {
        relative: true,
        files: [
            "./src/**/*.{js,ts,jsx,tsx,mdx}",
            "../../packages/components/src/**/*.{js,ts,jsx,tsx,mdx}",
        ],
    },

    // presets: [require("@dndnotes/tailwind-preset")],
};
