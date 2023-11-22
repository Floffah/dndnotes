import { httpBatchLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";

import type { AppRouter } from "@/server/router";

export const trpc = createTRPCNext<AppRouter>({
    config: () => ({
        links: [
            httpBatchLink({
                url: process.env.NEXT_PUBLIC_BASE_URL + "/api",
            }),
        ],
    }),
    ssr: true,
});
