import { TRPCError } from "@trpc/server";
import { serialize } from "cookie";
import cryptoRandomString from "crypto-random-string";
import { addDays } from "date-fns";
import { addMonths } from "date-fns/addMonths";
import { and, eq, inArray, like } from "drizzle-orm";
import { z } from "zod";

import { SESSION_TOKEN } from "@dndnotes/lib";
import { db, userOAuthProviders, userSessions, users } from "@dndnotes/models";

import { procedure, router } from "@/trpc/trpc";

export const authenticationRouter = router({
    loginWithDiscord: procedure
        .input(
            z.object({
                code: z.string(),
            }),
        )
        .mutation(async (opts) => {
            const codeExchangeResponse = await fetch(
                "https://discord.com/api/oauth2/token",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: new URLSearchParams({
                        code: opts.input.code,
                        grant_type: "authorization_code",
                        client_id: process.env
                            .NEXT_PUBLIC_DISCORD_CLIENT_ID as string,
                        client_secret: process.env
                            .DISCORD_CLIENT_SECRET as string,
                        redirect_uri: process.env
                            .NEXT_PUBLIC_DISCORD_REDIRECT_URI as string,
                    }),
                },
            ).then((res) => res.json());

            if (
                codeExchangeResponse.error ||
                !codeExchangeResponse.access_token
            ) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message:
                        codeExchangeResponse.error_description ??
                        "No access token provided",
                });
            }

            const accessToken = codeExchangeResponse.access_token;

            const discordUser = await fetch(
                "https://discord.com/api/users/@me",
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                },
            ).then((res) => res.json());

            if (discordUser.error || !discordUser.id) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message:
                        discordUser.error_description ?? "No user id provided",
                });
            }

            let username = discordUser.username.toLowerCase() as string;

            const existingUsersWithUsername = await db.query.users.findMany({
                where: (users) => like(users.name, `${username}%`),
            });

            if (existingUsersWithUsername.length > 0) {
                username += existingUsersWithUsername.length + 1;
            }

            const userProvider = await db.query.userOAuthProviders.findFirst({
                where: (providers) =>
                    and(
                        eq(providers.provider, "DISCORD"),
                        eq(providers.providerUserId, discordUser.id),
                    ),
            });

            let user;

            if (!userProvider) {
                await db.insert(users).values({
                    name: username,
                    email: discordUser.email,
                });
                user = await db.query.users.findFirst({
                    where: (users) => eq(users.name, username),
                });

                await db.insert(userOAuthProviders).values({
                    provider: "DISCORD",
                    providerUserId: discordUser.id,
                    userId: user!.id,
                });
            } else {
                user = await db.query.users.findFirst({
                    where: (users) => eq(users.id, userProvider.userId),
                });

                const previousSessions = await db.query.userSessions.findMany({
                    where: (sessions) => eq(sessions.userId, user!.id),
                });

                let idsToDelete: number[] = [];

                for (const session of previousSessions) {
                    if (
                        session.expiresAt < new Date() ||
                        !session.lastUsedAt ||
                        session.lastUsedAt < addDays(new Date(), -7)
                    ) {
                        idsToDelete.push(session.id);
                    }
                }

                await db
                    .delete(userSessions)
                    .where(inArray(userSessions.id, idsToDelete));
            }

            const token = cryptoRandomString({ length: 64 });
            const expiresAt = addMonths(new Date(), 6);

            await db.insert(userSessions).values({
                userId: user!.id,
                token,
                expiresAt,
            });
            const session = await db.query.userSessions.findFirst({
                where: (sessions) => eq(sessions.token, token),
            });

            const reqURL = new URL(opts.ctx.req.url);

            if (
                reqURL.hostname === "localhost" ||
                reqURL.hostname.endsWith("dndnotes.app")
            ) {
                opts.ctx.resHeaders.append(
                    "Set-Cookie",
                    serialize(SESSION_TOKEN, token, {
                        path: "/",
                        secure: process.env.NODE_ENV === "production",
                        domain:
                            process.env.NODE_ENV === "production"
                                ? ".dndnotes.app"
                                : "localhost",
                        sameSite: "strict",
                        expires: expiresAt,
                    }),
                );
            }

            return {
                user: user!,
                session: session!,
            };
        }),
});
