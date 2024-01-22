"use client";

import { Hydrate as RQHydrate } from "@tanstack/react-query";
import { ComponentProps } from "react";
import { deserialize } from "superjson";

export function Hydrate({
    state,
    ...props
}: ComponentProps<typeof RQHydrate> & { state: any }) {
    return (
        <RQHydrate
            state={"json" in state ? deserialize(state) : state}
            {...props}
        />
    );
}
