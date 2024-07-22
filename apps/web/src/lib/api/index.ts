import { httpBatchLink, unstable_httpBatchStreamLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import { ssrPrepass } from "@trpc/next/ssrPrepass";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import superjson from "superjson";

import type { AppRouter } from "@dndnotes/api";
import { SESSION_TOKEN } from "@dndnotes/lib";

import { queryClientConfig } from "@/lib/api/reactQuery";

export const api = createTRPCNext<AppRouter>({
    transformer: superjson,
    ssr: true,
    ssrPrepass,
    config: (opts) => ({
        links: [
            // unstable_httpBatchStreamLink({
            //     transformer: superjson,
            //     url: process.env.NEXT_PUBLIC_BASE_URL + "/api",
            //     headers() {
            //         if (!opts?.ctx?.req?.headers) {
            //             return {};
            //         }
            //
            //         const headers = {
            //             ...opts.ctx.req.headers,
            //         };
            //
            //         if (
            //             headers.cookie &&
            //             !headers.cookie.includes(SESSION_TOKEN)
            //         ) {
            //             delete headers.cookie;
            //         }
            //
            //         return headers;
            //     },
            // }),
            httpBatchLink({
                url: process.env.NEXT_PUBLIC_BASE_URL + "/api",
                transformer: superjson,
                headers() {
                    if (!opts?.ctx?.req?.headers) {
                        return {};
                    }

                    const headers = {
                        ...opts.ctx.req.headers,
                    };

                    if (
                        headers.cookie &&
                        !headers.cookie.includes(SESSION_TOKEN)
                    ) {
                        delete headers.cookie;
                    }

                    return headers;
                },
            }),
        ],
        queryClientConfig,
    }),
});

export type TRPCInputTypes = inferRouterInputs<AppRouter>;
export type TRPCOutputTypes = inferRouterOutputs<AppRouter>;
