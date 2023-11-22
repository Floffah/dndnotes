"use client";

import { DehydratedState } from "@tanstack/query-core";
import { Hydrate } from "@tanstack/react-query";
import { FunctionComponent, PropsWithChildren } from "react";

import { trpc } from "@/app/api/lib/client/trpc";

export const TRPCProvider = trpc.withTRPC(
    ({ state, children }: PropsWithChildren<{ state?: DehydratedState }>) => {
        if (state) {
            return <Hydrate state={state}>{children}</Hydrate>;
        }

        return <>{children}</>;
    },
) as FunctionComponent<PropsWithChildren<{ state?: DehydratedState }>>;
