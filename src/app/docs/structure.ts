export type DocsStructure = (
    | string
    | { link: string; children: DocsStructure }
)[];

export const docsStructure: DocsStructure = [
    "roadmap",
    "privacyPolicy",
    "termsOfService",
];
