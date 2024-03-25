import { ServerError } from "@dndnotes/backend-framework";
import { UserSessionError } from "@dndnotes/models";

import { Context } from "@/router/context";

export async function ensureAuthenticated(ctx: Context) {
    if (!ctx.session) {
        throw new ServerError({
            code: "UNAUTHORIZED",
            message: UserSessionError.NOT_AUTHENTICATED,
        });
    }
}
