"use server";

import { DehydratedState } from "@tanstack/query-core";
import { PropsWithChildren } from "react";

import { getServerHelpers } from "@/lib/getServerHelpers";
import { ClientHydrationBoundary } from "@/providers/ClientHydrationBoundary";

export async function ServerHydrationBoundary({
    helpers,
    state,
    children,
}: PropsWithChildren<{
    helpers?: Awaited<ReturnType<typeof getServerHelpers>>;
    state?: DehydratedState;
}>) {
    const hydratedState = state ? state : helpers?.dehydrate?.();

    if (!hydratedState) {
        throw new Error("No hydrated state provided or could be generated");
    }

    return (
        <ClientHydrationBoundary state={hydratedState}>
            {children}
        </ClientHydrationBoundary>
    );
}
