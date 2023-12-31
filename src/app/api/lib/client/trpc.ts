import { createTRPCNext } from "@trpc/next";

import { trpcOptions, trpcQueryClientConfig } from "@/app/api/lib/trpcOptions";
import type { AppRouter } from "@/server/router";

export const trpc = createTRPCNext<AppRouter>({
    config: () => ({
        ...trpcOptions(),
        queryClientConfig: trpcQueryClientConfig,
    }),
    ssr: true,
});
