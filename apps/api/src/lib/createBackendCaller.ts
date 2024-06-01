import { appRouter } from "@/trpc";
import { createTRPCContext } from "@/trpc/context";
import { createCallerFactory } from "@/trpc/trpc";

const callerFactory = createCallerFactory(appRouter);

export async function createBackendCaller(request: Partial<Request>) {
    const ctx = await createTRPCContext({
        req: request as Request,
        resHeaders: new Headers(),
        info: null!,
    });

    return callerFactory(ctx);
}

export type ServerCaller = Awaited<ReturnType<typeof createBackendCaller>>;
