export function serializableClone(obj: any) {
    if (
        !obj ||
        typeof obj === "string" ||
        typeof obj === "number" ||
        typeof obj === "boolean" ||
        typeof obj === "bigint"
    ) {
        return obj;
    }

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
            newObj[key] = value.map(serializableClone);
        } else if (typeof value === "object") {
            newObj[key] = serializableClone(value);
        }
    }

    return newObj;
}
