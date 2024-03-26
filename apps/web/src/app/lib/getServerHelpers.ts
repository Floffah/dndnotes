import { headers } from "next/headers";
import { cache } from "react";
import superjson from "superjson";

import { createCallerClient } from "@dndnotes/backend-framework/server";
import { appRouter, createContext } from "@dndnotes/server/appRouter";

export const getServerHelpers = cache(async () => {
    return createCallerClient({
        ctx: await createContext({
            req: {
                headers: headers(),
            } as Request,
            resHeaders: new Headers(),
        }),
        router: appRouter,
        transformer: superjson,
    });
});
