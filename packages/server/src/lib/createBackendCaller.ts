import { createRouterCaller } from "@dndnotes/backend-framework/server";

import { appRouter } from "@/router";
import { createContext } from "@/router/context";

export async function createBackendCaller(request: Partial<Request>) {
    const ctx = await createContext({
        req: request as Request,
        resHeaders: new Headers(),
    });

    return createRouterCaller(appRouter, ctx);
}

export type ServerCaller = Awaited<ReturnType<typeof createBackendCaller>>;
