import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { appRouter, createTRPCContext } from "@dndnotes/api";

const handler = (req: Request) =>
    fetchRequestHandler({
        endpoint: "/api",
        req,
        router: appRouter,
        createContext: createTRPCContext,
    });

export { handler as GET, handler as POST };
