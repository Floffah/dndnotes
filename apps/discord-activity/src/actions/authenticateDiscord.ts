"use server";

import { REST } from "@discordjs/rest";
import cryptoRandomString from "crypto-random-string";
import { RESTGetAPICurrentUserResult, Routes } from "discord-api-types/v10";

import { UserModel, UserSessionModel } from "@dndnotes/api";
import { SESSION_TOKEN } from "@dndnotes/lib";
import { UserSessionType } from "@dndnotes/models";
import { cookies } from "next/headers";

export async function authenticateDiscord(code: string, guild_id: string) {
    if (!code || !guild_id) {
        throw new Error("Invalid payload");
    }

    const codeExchangeResponse = await fetch(
        "https://discord.com/api/oauth2/token",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                code: code,
                grant_type: "authorization_code",
                client_id: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID as string,
                client_secret: process.env.DISCORD_CLIENT_SECRET as string,
            }),
        },
    ).then((res) => res.json());

    if (codeExchangeResponse.error || !codeExchangeResponse.access_token) {
        throw new Error(
            codeExchangeResponse.error ?? "No access token provided",
        );
    }

    const accessToken = codeExchangeResponse.access_token;

    const discord = new REST({ version: "10", authPrefix: "Bearer" }).setToken(
        accessToken,
    );

    let userResponse: RESTGetAPICurrentUserResult;
    try {
        userResponse = (await discord.get(
            Routes.user("@me"),
        )) as RESTGetAPICurrentUserResult;
    } catch (e) {
        throw new Error("Invalid access token");
    }

    try {
        await discord.get(Routes.userGuildMember(guild_id));
    } catch (e) {
        throw new Error("Invalid guild id");
    }

    let username = userResponse.username.toLowerCase() as string;

    let user = await UserModel.findOne({
        "providers.discord.id": userResponse.id,
    });

    if (!user) {
        user = await UserModel.create({
            providers: {
                discord: {
                    id: userResponse.id,
                    username: userResponse.username,
                    email: userResponse.email,
                },
            },
            name: username,
            email: userResponse.email,
        });
    }

    const session = await UserSessionModel.findOneAndUpdate(
        {
            user: user._id,
            type: UserSessionType.DISCORD_EMBEDDED_APP,
        },
        {
            user: user._id,
            token: cryptoRandomString({ length: 64 }),
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30 * 6),
            type: UserSessionType.DISCORD_EMBEDDED_APP,
        },
        {
            new: true,
            upsert: true,
        },
    );

    cookies().set({
        name: SESSION_TOKEN,
        value: session.token,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain:
            process.env.NODE_ENV === "production"
                ? ".activity.dndnotes.app"
                : "localhost",
        sameSite: "strict",
    });

    return {
        accessToken,
        sessionToken: session.token
    }
};
