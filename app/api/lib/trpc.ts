import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";

import { AppRouter } from "@/server/router";

export const trpc = createTRPCProxyClient<AppRouter>({
    links: [
        httpBatchLink({
            url: "http://localhost:3000/api",
        }),
    ],
});
