"use client";

import {
    Component,
    FunctionComponent,
    PropsWithChildren,
    ReactNode,
} from "react";

import { trpc } from "@/app/api/lib/client/trpc";

export const TRPCProvider = trpc.withTRPC(({ children }: PropsWithChildren) => {
    return <>{children}</>;
}) as FunctionComponent<PropsWithChildren>;
