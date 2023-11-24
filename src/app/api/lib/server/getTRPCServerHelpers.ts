import { createTRPCProxyClient } from "@trpc/client";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { cookies } from "next/headers";
import { cache } from "react";

import { trpcOptions, trpcQueryClientConfig } from "@/app/api/lib/trpcOptions";
import type { AppRouter } from "@/server/router";

export const getTRPCServerHelpers = cache(() => {
    const proxyClient = createTRPCProxyClient<AppRouter>({
        ...trpcOptions({
            cookie: cookies().toString(),
        }),
    });

    return createServerSideHelpers({
        client: proxyClient,
        queryClientConfig: trpcQueryClientConfig,
    });
});
