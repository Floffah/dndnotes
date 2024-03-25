// may be passed camelCase, snake_case, kebab-case, or a sentence
export function toSentenceCase(str: string) {
    return str
        .replace(/_/g, " ")
        .replace(/-/g, " ")
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .split(" ")
        .map((word) => (word.length > 3 ? word : word.toLowerCase()))
        .join(" ");
}
