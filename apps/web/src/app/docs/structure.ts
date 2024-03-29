export type DocsStructure = (
    | string
    | { link: string; label: string; children?: DocsStructure }
)[];

export const docsStructure: DocsStructure = [
    {
        link: "/",
        label: "Docs",
    },
    "acknowledgements",
    "privacyPolicy",
    "termsOfService",
];
