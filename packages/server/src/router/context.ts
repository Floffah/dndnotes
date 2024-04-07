import { REST } from "@discordjs/rest";
import { parse } from "cookie";
import { Routes } from "discord-api-types/v10";
import superjson from "superjson";

import { ServerError, ServerErrorCode } from "@dndnotes/backend-framework";
import {
    FetchHandlerContext,
    createProtoBuilder,
} from "@dndnotes/backend-framework/server";
import { createErrorResponse } from "@dndnotes/discord-activity/src/lib/apiResponse";
import { SESSION_TOKEN } from "@dndnotes/lib";
import { UserSession, registerTransformerTypes } from "@dndnotes/models";
import { DiscordGuild } from "@dndnotes/models/src";

import { mongoConnect } from "@/lib/mongoDB";
import { DiscordGuildModel } from "@/models";
import { UserSessionModel } from "@/models/UserSessionModel";

const connectionPromise = mongoConnect();

export const createContext = async (opts: FetchHandlerContext) => {
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

    let access_token: string | null = null;
    let guild_id: string | null = null;
    let guild: DiscordGuild | null = null;
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
                await discord_app_client.get(Routes.userGuildMember(guild_id));
            } catch (e) {
                throw new ServerError({
                    code: ServerErrorCode.BAD_REQUEST,
                    message: "Invalid guild id",
                    cause: e,
                });
            }

            guild = await DiscordGuildModel.findOne({
                guildId: guild_id,
            });

            if (guild && guild.botInGuild) {
                discord_bot_client = new REST({
                    version: "10",
                    authPrefix: "Bot",
                }).setToken(process.env.DISCORD_BOT_TOKEN as string);
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
export type Context = Awaited<ReturnType<typeof createContext>>;

registerTransformerTypes();

export const { procedure, router } = createProtoBuilder({
    transformer: superjson,
}).context<Context>();
