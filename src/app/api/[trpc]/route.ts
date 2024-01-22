import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { registerTransformerTypes } from "@/db/lib/registerTransformerTypes";
import { appRouter } from "@/server/router";
import { createContext } from "@/server/trpc";

const handler = (req: Request) =>
    fetchRequestHandler({
        endpoint: "/api",
        req,
        router: appRouter,
        createContext,
    });

export { handler as GET, handler as POST };
