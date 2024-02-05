"use server";

import { PropsWithChildren } from "react";

import { getTRPCServerHelpers } from "@/app/api/lib/server/getTRPCServerHelpers";
import { Hydrate } from "@/app/providers/Hydrate";

export async function DehydrateServerQueryHelpers({
    helpers,
    children,
}: PropsWithChildren<{
    helpers: Awaited<ReturnType<typeof getTRPCServerHelpers>>;
}>) {
    return <Hydrate state={helpers.dehydrate()}>{children}</Hydrate>;
}
