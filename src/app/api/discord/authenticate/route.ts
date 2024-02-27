import cryptoRandomString from "crypto-random-string";

import {
    createErrorResponse,
    createSuccessResponse,
} from "@/app/api/apiResponse";
import { SESSION_TOKEN } from "@/app/lib/api/storageKeys";
import { UserAPIModel } from "@/db/models/User/consumers";
import { UserModel } from "@/db/models/User/model";
import { UserSessionModel } from "@/db/models/UserSession/model";
import { mongoConnect } from "@/db/mongo";

mongoConnect();

export const POST = async (req: Request) => {
    const body = await req.json();
    const code = body.code;

    if (!code) {
        return createErrorResponse("No code provided");
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
        return createErrorResponse(
            discordOauthJson.error ?? "No access token provided",
        );
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
        return createErrorResponse(
            discordUserJson.error ?? "No user id provided",
        );
    }

    let username = discordUserJson.username.toLowerCase() as string;

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
        },
        {
            user: user._id,
            token: cryptoRandomString({ length: 64 }),
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30 * 6),
        },
        {
            new: true,
            upsert: true,
        },
    );

    const response = createSuccessResponse({
        user: new UserAPIModel(user, { user }),
    });

    response.cookies.set({
        name: SESSION_TOKEN,
        value: session.token,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain:
            process.env.NODE_ENV === "production"
                ? ".dndnotes.floffah.dev"
                : "localhost",
        sameSite: "strict",
    });

    return response;
};
