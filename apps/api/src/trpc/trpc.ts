import { initTRPC } from "@trpc/server";
import superjson from "superjson";

import { TRPCContext } from "@/trpc/createTRPCContext";

const t = initTRPC.context<TRPCContext>().create({
    transformer: superjson,
});

export const createCallerFactory = t.createCallerFactory;

export const router = t.router;

export const procedure = t.procedure;
