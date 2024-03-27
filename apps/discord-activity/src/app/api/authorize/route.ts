import cryptoRandomString from "crypto-random-string";
import { NextResponse } from "next/server";

import { SESSION_TOKEN } from "@dndnotes/lib";
import { UserSessionType } from "@dndnotes/models";
import { UserModel, UserSessionModel } from "@dndnotes/server/appRouter";
import { createErrorResponse } from "@dndnotes/web/src/app/api/apiResponse";

export const POST = async (req: Request) => {
    const body = await req.json();
    const code = body.code;

    if (!code) {
        return createErrorResponse("No code provided");
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
        return createErrorResponse(
            codeExchangeResponse.error ?? "No access token provided",
        );
    }

    const accessToken = codeExchangeResponse.access_token;

    const userResponse = await fetch("https://discord.com/api/users/@me", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    }).then((res) => res.json());

    if (userResponse.error || !userResponse.id) {
        return createErrorResponse(userResponse.error ?? "No user id provided");
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

    const response = new NextResponse(
        JSON.stringify({
            ok: true,
            data: { access_token: accessToken, session_token: session.token },
        }),
    );

    response.cookies.set({
        name: SESSION_TOKEN,
        value: session.token,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain:
            process.env.NODE_ENV === "production"
                ? ".dnda.floffah.dev"
                : "localhost",
        sameSite: "strict",
    });

    return response;
};
