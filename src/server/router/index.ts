import { procedure, router } from "../trpc";

import { UserAPIModel } from "@/db/models/User/consumers";
import { mongoConnect } from "@/db/mongo";

mongoConnect();

export const appRouter = router({
    getCurrentUser: procedure.query((opts) => {
        if (!opts.ctx.session) return null;

        return new UserAPIModel(opts.ctx.session.user).toObject({
            user: opts.ctx.session.user,
        });
    }),
});

export type AppRouter = typeof appRouter;
