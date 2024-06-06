import { REST, RequestMethod } from "@discordjs/rest";
import { TRPCError } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/dist/adapters/fetch";
import { parse } from "cookie";
import {
    RESTGetCurrentUserGuildMemberResult,
    Routes,
} from "discord-api-types/v10";
import { ObjectId } from "mongodb";
import { HydratedDocument } from "mongoose";

import { SESSION_TOKEN } from "@dndnotes/lib";
import { DiscordGuild, DiscordGuildError, UserSession } from "@dndnotes/models";

import { cacheDiscordResponse } from "@/lib/cacheDiscordResponse";
import { mongoConnect } from "@/lib/mongoDB";
import { DiscordGuildModel, UserModel } from "@/models";
import { UserSessionModel } from "@/models/UserSessionModel";

const connectionPromise = mongoConnect();

export const createTRPCContext = async (opts: FetchCreateContextFnOptions) => {
    if (
        !opts.req.headers.has("cookie") &&
        !opts.req.headers.has("x-session-token")
    ) {
        return {};
    }

    let token = "";

    if (opts.req.headers.has("x-session-token")) {
        token = opts.req.headers.get("x-session-token") as string;
    } else {
        const cookies = parse(opts.req.headers.get("cookie") as string);
        token = cookies[SESSION_TOKEN];
    }

    if (!token || token.trim() === "" || token.length < 10) {
        return {};
    }

    await connectionPromise;

    const session = await UserSessionModel.findOne({
        token,
    })
        .populate("user")
        .exec();

    if (!session) {
        return {};
    }

    await UserModel.updateOne(
        {
            _id: new ObjectId(session.user.id),
        },
        {
            lastActiveAt: new Date(),
        },
    );

    let access_token: string | null = null;
    let guild_id: string | null = null;
    let guild: HydratedDocument<DiscordGuild> | null = null;
    let discord_app_client: REST | null = null;
    let discord_bot_client: REST | null = null;

    if (opts.req.headers.has("x-access-token")) {
        access_token = opts.req.headers.get("x-access-token") as string;

        discord_app_client = new REST({
            version: "10",
            authPrefix: "Bearer",
        }).setToken(access_token);

        if (
            opts.req.headers.has("x-guild-id") &&
            typeof process.env.DISCORD_BOT_TOKEN === "string"
        ) {
            guild_id = opts.req.headers.get("x-guild-id") as string;

            try {
                await cacheDiscordResponse(
                    discord_app_client,
                    {
                        method: RequestMethod.Get,
                        fullRoute: Routes.userGuildMember(guild_id),
                    },
                    {
                        session,
                        guild_id,
                    },
                );
            } catch (e: any) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: DiscordGuildError.INVALID_ID,
                    cause: e,
                });
            }

            discord_bot_client = new REST({
                version: "10",
                authPrefix: "Bot",
            }).setToken(process.env.DISCORD_BOT_TOKEN as string);

            guild = await DiscordGuildModel.findOne({
                guildId: guild_id,
            });

            let botMember: RESTGetCurrentUserGuildMemberResult | null;
            try {
                botMember = (await cacheDiscordResponse(
                    discord_bot_client,
                    {
                        method: RequestMethod.Get,
                        fullRoute: Routes.guildMember(
                            guild_id,
                            process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
                        ),
                    },
                    {
                        session,
                        guild_id,
                    },
                )) as any;
            } catch (e) {
                botMember = null;
            }

            if (guild && botMember && !guild.botInGuild) {
                guild.botInGuild = true;
                await guild.save();
            } else if (guild && !botMember && guild.botInGuild) {
                guild.botInGuild = false;
                await guild.save();
            } else if (!guild) {
                guild = new DiscordGuildModel({
                    guildId: guild_id,
                    botInGuild: !!botMember,
                });
                await guild.save();
            }
        }
    }

    return {
        session: session as UserSession,
        access_token,
        guild_id,
        guild,
        discord_app_client,
        discord_bot_client,
    };
};

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;