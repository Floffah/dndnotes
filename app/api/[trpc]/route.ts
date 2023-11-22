import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { connectMongo } from "@/db/mongo";
import { appRouter } from "@/server/router";
import { createContext } from "@/server/trpc";

connectMongo();

const handler = (req: Request) =>
    fetchRequestHandler({
        endpoint: "/api",
        req,
        router: appRouter,
        createContext,
    });

export { handler as GET, handler as POST };
