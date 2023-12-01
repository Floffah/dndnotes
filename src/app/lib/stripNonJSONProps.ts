export function stripNonJSONProps(obj: any) {
    const newObj: any = {};

    for (const [key, value] of Object.entries(obj)) {
        if (
            !value ||
            typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean" ||
            typeof value === "bigint"
        ) {
            newObj[key] = value;
        } else if (Array.isArray(value)) {
            newObj[key] = value.map(stripNonJSONProps);
        } else if (typeof value === "object") {
            newObj[key] = stripNonJSONProps(value);
        }
    }

    return newObj;
}
