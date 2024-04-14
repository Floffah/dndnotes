export interface CreateContextArgs {
    req: Request;
    resHeaders: Headers;

    defer: (fn: () => Promise<unknown>) => Promise<unknown>;
}
