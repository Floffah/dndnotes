import { z } from "zod";

import { UserAPIModel } from "@/db/models/User/consumers";
import { UserModel } from "@/db/models/User/model";
import { userFriendsRouter } from "@/server/router/user/friends";
import { procedure, router } from "@/server/trpc";

export const userRouter = router({
    friends: userFriendsRouter,

    me: procedure.query((opts) => {
        if (!opts.ctx.session) return null;

        return new UserAPIModel(opts.ctx.session.user, {
            user: opts.ctx.session?.user,
        });
    }),
    get: procedure
        .input(
            z.object({
                id: z.string(),
            }),
        )
        .query(async (opts) => {
            const user = await UserModel.findById(new Object(opts.input.id));

            if (!user) return null;

            return new UserAPIModel(user, { user: opts.ctx.session?.user });
        }),
});
