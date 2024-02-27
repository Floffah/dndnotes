import { QueryClientConfig } from "@tanstack/react-query";
import {
    CreateTRPCClientOptions,
    HTTPHeaders,
    httpBatchLink,
} from "@trpc/client";
import { WithTRPCConfig } from "@trpc/next";
import superjson from "superjson";

import { registerTransformerTypes } from "@/db/lib/registerTransformerTypes";
import type { AppRouter } from "@/server/router";

registerTransformerTypes();

export const getTRPCOptions = <Opts extends Partial<WithTRPCConfig<AppRouter>>>(
    extend: Opts,
    headers?: HTTPHeaders,
) =>
    ({
        ...extend,
        links: [
            httpBatchLink({
                url: process.env.NEXT_PUBLIC_BASE_URL + "/api",
                headers,
                transformer: superjson,
            }),
            ...(extend.links ?? []),
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
