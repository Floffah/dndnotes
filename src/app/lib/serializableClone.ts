export function serializableClone(obj: any, visitedNodes = new WeakMap()) {
    if (
        !obj ||
        typeof obj === "string" ||
        typeof obj === "number" ||
        typeof obj === "boolean" ||
        typeof obj === "bigint" ||
        typeof obj === "symbol" ||
        obj instanceof Date
    ) {
        return obj;
    }

    if (visitedNodes.has(obj)) {
        return visitedNodes.get(obj);
    }

    if (Array.isArray(obj)) {
        const result = obj.map((x) => serializableClone(x, visitedNodes));
        visitedNodes.set(obj, result);
        return result;
    }

    const newObj = {};

    for (const [key, value] of Object.entries(obj)) {
        if (key.startsWith("_")) continue;

        if (
            !value ||
            typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean" ||
            typeof value === "bigint" ||
            typeof value === "symbol" ||
            value instanceof Date
        ) {
            newObj[key] = value;
        } else if (Array.isArray(value)) {
            newObj[key] = value.map((x) => serializableClone(x, visitedNodes));
        } else if (typeof value === "object" && Object.keys(value).length > 0) {
            newObj[key] = serializableClone(value, visitedNodes);
        }
    }

    visitedNodes.set(obj, newObj);

    return newObj;
}
