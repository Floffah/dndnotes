import { TRPCError } from "@trpc/server";
import { ObjectId } from "mongodb";
import { z } from "zod";

import { UserAPIModel } from "@/db/models/User/consumers";
import { UserError } from "@/db/models/User/error";
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

            if (opts.input.id && !ObjectId.isValid(opts.input.id)) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: UserError.NOT_FOUND,
                });
            }

            if (!user) return null;

            return new UserAPIModel(user, { user: opts.ctx.session?.user });
        }),
});
