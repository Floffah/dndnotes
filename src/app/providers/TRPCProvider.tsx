"use client";

import { DehydratedState } from "@tanstack/query-core";
import { FunctionComponent, PropsWithChildren } from "react";

import { trpc } from "@/app/lib/api/trpc";
import { ClientHydrationBoundary } from "@/app/providers/ClientHydrationBoundary";

export const TRPCProvider = trpc.withTRPC(
    ({ state, children }: PropsWithChildren<{ state?: DehydratedState }>) => {
        if (state) {
            return (
                <ClientHydrationBoundary state={state}>
                    {children}
                </ClientHydrationBoundary>
            );
        }

        return <>{children}</>;
    },
) as FunctionComponent<PropsWithChildren<{ state?: DehydratedState }>>;
