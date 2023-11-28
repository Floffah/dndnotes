import { PropsWithChildren } from "react";

import { getTRPCServerHelpers } from "@/app/api/lib/server/getTRPCServerHelpers";
import { TRPCProvider } from "@/app/providers/TRPCProvider";

export async function HydrationProvider({ children }: PropsWithChildren) {
    const helpers = getTRPCServerHelpers();

    await helpers.user.me.prefetch();

    return <TRPCProvider state={helpers.dehydrate()}>{children}</TRPCProvider>;
}
