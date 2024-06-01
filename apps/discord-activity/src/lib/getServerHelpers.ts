import { createServerSideHelpers } from "@trpc/react-query/server";
import { headers } from "next/headers";
import { cache } from "react";
import superjson from "superjson";

import { appRouter, createTRPCContext } from "@dndnotes/api";

import { queryClientConfig } from "@/lib/reactQuery";

export const getServerHelpers = cache(async () => {
    const ctx = await createTRPCContext({
        req: {
            headers: headers(),
        } as Request,
        resHeaders: new Headers(),
        info: null!,
    });

    return createServerSideHelpers({
        ctx,
        router: appRouter,
        transformer: superjson,
        queryClientConfig: queryClientConfig,
    });
});
