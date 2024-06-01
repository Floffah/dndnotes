import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";

import {
    UserSession,
    UserSessionError,
    registerTransformerTypes,
} from "@dndnotes/models";

import { TRPCContext } from "@/trpc/context";

const t = initTRPC.context<TRPCContext>().create({
    transformer: superjson,
});

registerTransformerTypes();

export const createCallerFactory = t.createCallerFactory;

export const router = t.router;

export const procedure = t.procedure;

export const authedProcedure = t.procedure.use(async (opts) => {
    if (!opts.ctx.session) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: UserSessionError.NOT_AUTHENTICATED,
        });
    }

    return opts.next({
        ctx: opts.ctx as TRPCContext & { session: UserSession },
    });
});
