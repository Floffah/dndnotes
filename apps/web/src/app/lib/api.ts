import { httpBatchLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import superjson from "superjson";

import { AppRouter } from "@dndnotes/api";
import { registerTransformerTypes } from "@dndnotes/models";

import { queryClientConfig } from "@/app/lib/reactQuery";

registerTransformerTypes();

export const api = createTRPCNext<AppRouter>({
    config: () => ({
        links: [
            httpBatchLink({
                url: process.env.NEXT_PUBLIC_BASE_URL + "/api",
                transformer: superjson,
            }),
        ],
        queryClientConfig,
    }),
    transformer: superjson,
    ssr: true,
    ssrPrepass: () => Promise.resolve(),
});

export type TRPCInputTypes = inferRouterInputs<AppRouter>;
export type TRPCOutputTypes = inferRouterOutputs<AppRouter>;
