import { headers } from "next/headers";

import { createContext } from "@/server/trpc";

export async function createNextTRPCContext(): Promise<
    Awaited<ReturnType<typeof createContext>>
> {
    return await createContext({
        req: {
            headers: headers(),
        } as Request,
        resHeaders: new Headers(),
        info: {
            isBatchCall: false,
            calls: [],
        },
    });
}
