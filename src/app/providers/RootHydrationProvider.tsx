import { PropsWithChildren } from "react";

import { getTRPCServerHelpers } from "@/app/api/lib/server/getTRPCServerHelpers";
import { serializableClone } from "@/app/lib/serializableClone";
import { TRPCProvider } from "@/app/providers/TRPCProvider";

export async function RootHydrationProvider({ children }: PropsWithChildren) {
    const helpers = await getTRPCServerHelpers();

    await helpers.user.me.prefetch();

    return (
        <TRPCProvider state={serializableClone(helpers.dehydrate())}>
            {children}
        </TRPCProvider>
    );
}
