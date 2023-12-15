const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
    theme: {
        fontFamily: {
            sans: ["Nunito", "sans-serif"],
        },
        extend: {
            spacing: {
                0.75: "0.188rem", // (3px)
                2.25: "0.563rem", // (9px)
            },
            colors: {
                discord: {
                    blurple: "#5865F2",
                },
            },
            animation: {
                fadeIn: "fadeIn 0.1s ease-in-out",
                fadeOut: "fadeOut 0.1s ease-in-out",
            },
        },
    },
    plugins: [
        plugin(({ matchUtilities, theme }) =>
            matchUtilities(
                {
                    indicate: (value) => ({
                        "--indicate-color": `${value}`,
                    }),
                },
                {
                    values: theme("colors"),
                    type: "color",
                },
            ),
        ),
    ],
};
