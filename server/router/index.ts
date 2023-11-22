import { procedure, router } from "../trpc";

import { UserAPIModel, UserAPIType } from "@/db/models/User/consumers";

export const appRouter = router({
    getCurrentUser: procedure.query((opts) => {
        if (!opts.ctx.session) return null;

        return new UserAPIModel(opts.ctx.session.user).toObject({
            user: opts.ctx.session.user,
        });
    }),
});

export type AppRouter = typeof appRouter;
