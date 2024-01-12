import { TRPCError } from "@trpc/server";

import { UserSessionError } from "@/db/models/UserSession/error";
import type { Context } from "@/server/trpc";

export async function ensureAuthenticated(ctx: Context) {
    if (!ctx.session) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: UserSessionError.NOT_AUTHENTICATED,
        });
    }
}
