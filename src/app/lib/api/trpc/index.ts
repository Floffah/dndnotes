import { createTRPCNext } from "@trpc/next";
import superjson from "superjson";

import {
    getTRPCOptions,
    trpcQueryClientConfig,
} from "@/app/lib/api/trpc/config";
import type { AppRouter } from "@/server/router";

export const trpc = createTRPCNext<AppRouter>({
    config: () =>
        getTRPCOptions({
            queryClientConfig: trpcQueryClientConfig,
        }),
    ssr: true,
    transformer: superjson,
    ssrPrepass: (query) => query,
});
