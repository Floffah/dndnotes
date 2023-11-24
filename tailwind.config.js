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
            },
            colors: {
                discord: {
                    blurple: "#5865F2",
                },
            },
        },
    },
    plugins: [],
};
