import { appRouter } from "@/server/router";
import { createContext } from "@/server/trpc";

export async function createTRPCServerCaller(request: Partial<Request>) {
    const ctx = await createContext({
        req: request as Request,
        resHeaders: new Headers(),
    });

    return appRouter.createCaller(ctx);
}
export type TRPCServerCaller = Awaited<
    ReturnType<typeof createTRPCServerCaller>
>;
