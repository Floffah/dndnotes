import { headers } from "next/headers";
import { cache } from "react";
import superjson from "superjson";

import { createCallerClient } from "@dndnotes/backend-framework/server";
import { appRouter, createContext } from "@dndnotes/server/appRouter";

export const getServerHelpers = cache(async () => {
    const deferredPromises: Promise<unknown>[] = [];

    const ctx = await createContext({
        req: {
            headers: headers(),
        } as Request,
        resHeaders: new Headers(),
        defer: (fn) => {
            const promise = fn();
            deferredPromises.push(promise);
            return promise;
        },
    });

    await Promise.all(deferredPromises);

    return createCallerClient({
        ctx,
        router: appRouter,
        transformer: superjson,
    });
});
