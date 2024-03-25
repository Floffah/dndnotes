import { createFetchHandler } from "@dndnotes/backend-framework/server";
import { appRouter, createContext } from "@dndnotes/server/appRouter";

const handler = createFetchHandler({
    appRouter,
    createContext,
});

export { handler as GET, handler as POST };
