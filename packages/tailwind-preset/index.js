const plugin = require("tailwindcss/plugin");
const flattenColorPalette =
    require("tailwindcss/lib/util/flattenColorPalette").default;

const { resolve } = require("path");

const componentsDirectory = resolve(__dirname, "../components");

/** @type {import('tailwindcss').Config} */
module.exports = {
    theme: {
        fontFamily: {
            sans: "var(--font-sans)",
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
        require("@tailwindcss/typography"),
        plugin(({ matchUtilities, theme }) =>
            matchUtilities(
                {
                    indicate: (value) => ({
                        "--indicate-color": `${value}`,
                    }),
                },
                {
                    values: flattenColorPalette(theme("colors")),
                    type: "color",
                },
            ),
        ),
    ],
};
