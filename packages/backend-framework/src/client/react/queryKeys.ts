export const getQueryKey = (path: string[], input?: any) =>
    input ? [...path, input] : [path];
