import { UserAPIModel } from "@/db/models/User/consumers";
import { procedure, router } from "@/server/trpc";

export const userRouter = router({
    me: procedure.query((opts) => {
        if (!opts.ctx.session) return null;

        return new UserAPIModel(opts.ctx.session.user).toObject({
            user: opts.ctx.session.user,
        });
    }),
});
