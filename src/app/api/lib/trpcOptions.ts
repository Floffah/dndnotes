import { QueryClientConfig } from "@tanstack/react-query";
import {
    CreateTRPCClientOptions,
    HTTPBatchLinkOptions,
    httpBatchLink,
} from "@trpc/client";

import type { AppRouter } from "@/server/router";

export const trpcOptions = (headers?: HTTPBatchLinkOptions["headers"]) =>
    ({
        links: [
            httpBatchLink({
                url: process.env.NEXT_PUBLIC_BASE_URL + "/api",
                headers,
            }),
        ],
    }) satisfies CreateTRPCClientOptions<AppRouter>;

export const trpcQueryClientConfig = {
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 30,
        },
    },
} satisfies QueryClientConfig;
