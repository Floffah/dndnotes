"use server";

import cryptoRandomString from "crypto-random-string";
import { cookies } from "next/headers";
import { serialize } from "superjson";

import { UserModel, UserSessionModel, mongoConnect } from "@dndnotes/api";
import { SESSION_TOKEN } from "@dndnotes/lib";
import {
    UserAPIModel,
    UserSessionType,
    registerTransformerTypes,
} from "@dndnotes/models";

registerTransformerTypes();
const mongoPromise = mongoConnect();

export async function authenticateDiscord(code: string) {
    if (!code) {
        throw new Error("No code provided");
    }

    const discordOauthResponse = await fetch(
        "https://discord.com/api/oauth2/token",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                code,
                grant_type: "authorization_code",
                client_id: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID as string,
                client_secret: process.env.DISCORD_CLIENT_SECRET as string,
                redirect_uri: process.env
                    .NEXT_PUBLIC_DISCORD_REDIRECT_URI as string,
            }),
        },
    );
    const discordOauthJson = await discordOauthResponse.json();

    if (discordOauthJson.error || !discordOauthJson.access_token) {
        throw new Error(discordOauthJson.error ?? "No access token provided");
    }

    const discordUserResponse = await fetch(
        "https://discord.com/api/users/@me",
        {
            headers: {
                Authorization: `Bearer ${discordOauthJson.access_token}`,
            },
        },
    );
    const discordUserJson = await discordUserResponse.json();

    if (discordUserJson.error || !discordUserJson.id) {
        throw new Error(discordUserJson.error ?? "No user id provided");
    }

    let username = discordUserJson.username.toLowerCase() as string;

    await mongoPromise;
    const existingUsersWithUsername = await UserModel.find({
        name: {
            $regex: new RegExp(`^${username}`, "i"),
        },
    });

    if (existingUsersWithUsername.length > 0) {
        username += existingUsersWithUsername.length + 1;
    }

    let user = await UserModel.findOne({
        "providers.discord.id": discordUserJson.id,
    });

    if (!user) {
        user = await UserModel.create({
            providers: {
                discord: {
                    id: discordUserJson.id,
                    username: discordUserJson.username,
                    email: discordUserJson.email,
                },
            },
            name: username,
            email: discordUserJson.email,
        });
    }

    const session = await UserSessionModel.findOneAndUpdate(
        {
            user: user._id,
            type: UserSessionType.WEB,
        },
        {
            user: user._id,
            token: cryptoRandomString({ length: 64 }),
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30 * 6),
            type: UserSessionType.WEB,
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
                ? ".dndnotes.app"
                : "localhost",
        sameSite: "strict",
    });

    return serialize(new UserAPIModel(user, { user }));
}
