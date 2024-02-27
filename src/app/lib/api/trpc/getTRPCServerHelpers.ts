import { createServerSideHelpers } from "@trpc/react-query/server";
import { cache } from "react";
import superjson from "superjson";

import { trpcQueryClientConfig } from "@/app/lib/api/trpc/config";
import { createNextTRPCContext } from "@/server/lib/createNextTRPCContext";
import { appRouter } from "@/server/router";

export const getTRPCServerHelpers = cache(async () => {
    return createServerSideHelpers({
        ctx: await createNextTRPCContext(),
        router: appRouter,
        queryClientConfig: trpcQueryClientConfig,
        transformer: superjson,
    });
});
