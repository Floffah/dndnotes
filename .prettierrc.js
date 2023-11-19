module.exports = {
    trailingComma: "all",
    tabWidth: 4,
    semi: true,
    singleQuote: false,
    jsxSingleQuote: false,
    jsxBracketSameLine: false,
    arrowParens: "always",
    endOfLine: "lf",
    embeddedLanguageFormatting: "auto",
    tailwindConfig: "./tailwind.config.js",
    tailwindFunctions: ["clsx"],

    importOrder: [
        "reflect-metadata",
        "<THIRD_PARTY_MODULES>",
        "^@crossant/(.*)$",
        "@/(.*)$",
    ],
    importOrderSeparation: true,
    importOrderSortSpecifiers: true,
    importOrderGroupNamespaceSpecifiers: true,

    plugins: [
        "@trivago/prettier-plugin-sort-imports",
        "prettier-plugin-tailwindcss",
    ],
};
