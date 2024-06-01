import { httpBatchLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import superjson from "superjson";

import type { AppRouter } from "@dndnotes/api";
import { registerTransformerTypes } from "@dndnotes/models";

import { queryClientConfig } from "@/lib/reactQuery";

registerTransformerTypes();

export const trpcAuthContext = {
    sessionToken: undefined as string | undefined,
    accessToken: undefined as string | undefined,
    guildId: undefined as string | undefined,
};

export const api = createTRPCNext<AppRouter>({
    config: () => ({
        links: [
            httpBatchLink({
                url: process.env.NEXT_PUBLIC_BASE_URL + "/api",
                transformer: superjson,
                headers: () => ({
                    "x-session-token": trpcAuthContext.sessionToken,
                    "x-access-token": trpcAuthContext.accessToken,
                    "x-guild-id": trpcAuthContext.guildId,
                }),
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
