import { createRouterCaller } from "@dndnotes/backend-framework/server";

import { appRouter } from "@/router";
import { createContext } from "@/router/context";

export async function createBackendCaller(request: Partial<Request>) {
    const deferredPromises: Promise<unknown>[] = [];

    const ctx = await createContext({
        req: request as Request,
        resHeaders: new Headers(),
        defer: (fn) => {
            const promise = fn();
            deferredPromises.push(promise);
            return promise;
        },
    });

    await Promise.all(deferredPromises);
    return createRouterCaller(appRouter, ctx);
}

export type ServerCaller = Awaited<ReturnType<typeof createBackendCaller>>;
