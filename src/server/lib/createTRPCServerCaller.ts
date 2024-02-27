import { appRouter } from "@/server/router";
import { createCallerFactory, createContext } from "@/server/trpc";

let callerFactory;

export async function createTRPCServerCaller(request: Partial<Request>) {
    const ctx = await createContext({
        req: request as Request,
        resHeaders: new Headers(),
        info: {
            isBatchCall: false,
            calls: [],
        },
    });

    if (!callerFactory) {
        callerFactory = createCallerFactory(appRouter);
    }

    return callerFactory(ctx);
}

export type TRPCServerCaller = Awaited<
    ReturnType<typeof createTRPCServerCaller>
>;
