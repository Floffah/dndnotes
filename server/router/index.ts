import { procedure, router } from "../trpc";
import { z } from "zod";

import { UserAPIModel } from "@/db/models/User/consumers";
import { mongoConnect } from "@/db/mongo";

mongoConnect();

export const appRouter = router({
    getCurrentUser: procedure
        .input(
            z.optional(
                z.object({
                    sessionToken: z.string(),
                }),
            ),
        )
        .query((opts) => {
            if (!opts.ctx.session) return null;

            return new UserAPIModel(opts.ctx.session.user).toObject({
                user: opts.ctx.session.user,
            });
        }),
});

export type AppRouter = typeof appRouter;
