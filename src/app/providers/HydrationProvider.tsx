import { PropsWithChildren } from "react";

import { getTRPCServerHelpers } from "@/app/api/lib/server/getTRPCServerHelpers";
import { stripNonJSONProps } from "@/app/lib/stripNonJSONProps";
import { TRPCProvider } from "@/app/providers/TRPCProvider";

export async function HydrationProvider({ children }: PropsWithChildren) {
    const helpers = await getTRPCServerHelpers();

    await helpers.user.me.prefetch();

    return (
        <TRPCProvider state={stripNonJSONProps(helpers.dehydrate())}>
            {children}
        </TRPCProvider>
    );
}
