export function isPopulated(model: any) {
    return model && "db" in model;
}
