import { ServerError } from "@dndnotes/backend-framework";
import { UserAPIModel, UserError } from "@dndnotes/models";
import { ObjectId } from "mongodb";
import { z } from "zod";

import { UserModel } from "@/models/UserModel";
import { procedure, router } from "@/router/context";
import { userFriendsRouter } from "@/router/user/friends";

export const userRouter = router({
    friends: userFriendsRouter,

    me: procedure(z.void()).query((opts) => {
        if (!opts.ctx.session) return null;

        return new UserAPIModel(opts.ctx.session.user, {
            user: opts.ctx.session?.user,
        });
    }),
    get: procedure(
        z.object({
            id: z.string(),
        }),
    ).query(async (opts) => {
        const user = await UserModel.findById(new Object(opts.input.id));

        if (opts.input.id && !ObjectId.isValid(opts.input.id)) {
            throw new ServerError({
                code: "NOT_FOUND",
                message: UserError.NOT_FOUND,
            });
        }

        if (!user) return null;

        return new UserAPIModel(user, { user: opts.ctx.session?.user });
    }),
});
