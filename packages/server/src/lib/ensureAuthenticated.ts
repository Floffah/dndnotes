import { UserSessionError } from "@dndnotes/models";
import { TRPCError } from "@trpc/server";

import { Context } from "@/router/context";

export async function ensureAuthenticated(ctx: Context) {
    if (!ctx.session) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: UserSessionError.NOT_AUTHENTICATED,
        });
    }
}
