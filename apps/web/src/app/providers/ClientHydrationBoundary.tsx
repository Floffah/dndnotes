"use client";

import { HydrationBoundary as RQHydrationBoundary } from "@tanstack/react-query";
import { ComponentProps } from "react";
import { deserialize } from "superjson";

export function ClientHydrationBoundary({
    state,
    ...props
}: ComponentProps<typeof RQHydrationBoundary> & { state: any }) {
    return (
        <RQHydrationBoundary
            state={"json" in state ? deserialize(state) : state}
            {...props}
        />
    );
}
