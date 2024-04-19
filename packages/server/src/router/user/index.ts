import { ObjectId } from "mongodb";
import { HydratedDocument } from "mongoose";
import { z } from "zod";

import { ServerError } from "@dndnotes/backend-framework";
import { UserAPIModel, UserError } from "@dndnotes/models";
import { UserSession } from "@dndnotes/models/src";

import { ensureAuthenticated } from "@/lib/ensureAuthenticated";
import { pubnub } from "@/lib/pubnub";
import { UserModel } from "@/models/UserModel";
import { procedure, router } from "@/router/context";
import { userFriendsRouter } from "@/router/user/friends";

export const userRouter = router({
    friends: userFriendsRouter,

    me: procedure().query((opts) => {
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

    getRealtimeToken: procedure().query(async (opts) => {
        await ensureAuthenticated(opts.ctx);

        let token = opts.ctx.session!.realTimeToken;

        const channels: string[] = [];

        if (opts.ctx.guild) {
            channels.push(`discord-guild:${opts.ctx.guild.id}`);
        }

        if (
            token &&
            (token.channels.length !== channels.length ||
                !channels.every((channel) =>
                    token!.channels.includes(channel),
                ) ||
                !token.channels.every((channel) => channels.includes(channel)))
        ) {
            await pubnub.revokeToken(token.token);
            token = null;
        }

        if (channels.length === 0) {
            return null;
        }

        if (!token || token.expiresAt < new Date()) {
            const pubnubToken = await pubnub.grantToken({
                ttl: 60 * 24 * 14,
                resources: {
                    channels: channels.reduce((acc, channel) => {
                        acc[channel] = { read: true };
                        return acc;
                    }, {}),
                },
            });

            token = {
                token: pubnubToken,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
                channels,
            };

            opts.ctx.session!.realTimeToken = token;
            await (
                opts.ctx.session as unknown as HydratedDocument<UserSession>
            ).save();
        }

        return token;
    }),
});
