"use client";

import {
    DiscordSDK,
    RPCCloseCodes,
    patchUrlMappings,
} from "@discord/embedded-app-sdk";
import { useQuery } from "@tanstack/react-query";
import { Routes } from "discord-api-types/v10";
import { createContext, useContext, useEffect, useRef } from "react";

import { Loader } from "@dndnotes/components";

import { api, trpcAuthContext } from "@/lib/api";

interface MutableActivity {
    title: string;
    details: string;
    party?: [number, number];
}

interface DiscordContextValue {
    loading: boolean;
    sdk: DiscordSDK;
    auth?: Awaited<ReturnType<DiscordSDK["commands"]["authenticate"]>>;

    updateActivity: (activity?: Partial<MutableActivity>) => Promise<void>;
    inviteBot: () => Promise<void>;
}

export enum ConsoleLevel {
    DEBUG = "debug",
    INFO = "info",
    WARN = "warn",
    ERROR = "error",
    LOG = "log",
}

export const DiscordContext = createContext<DiscordContextValue>(null!);

export const useDiscord = () => useContext(DiscordContext);

const sdk = new DiscordSDK(process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID as string);

export function DiscordProvider({ children }) {
    const loadedAtRef = useRef(Date.now());
    const activityRef = useRef<MutableActivity>({
        title: "Not in a session",
        details: "Idling",
    });

    const log = (message: any, level: ConsoleLevel = ConsoleLevel.DEBUG) =>
        sdk.commands.captureLog({ message, level });

    const authenticateQuery = useQuery({
        staleTime: Infinity,
        retry: false,
        queryKey: ["discord", "authenticate", "embedded_app_sdk"],
        queryFn: async () => {
            console.debug("Waiting for SDK to be ready");

            await sdk.ready();

            log("SDK is ready");

            let code: string;

            try {
                const authorization = await sdk.commands.authorize({
                    client_id: process.env
                        .NEXT_PUBLIC_DISCORD_CLIENT_ID as string,
                    response_type: "code",
                    prompt: "none",
                    scope: [
                        "identify",
                        "email",
                        "guilds",
                        "guilds.members.read",
                        "rpc.activities.write",
                    ],
                });
                code = authorization.code;
            } catch (e: any) {
                log(e, ConsoleLevel.ERROR);

                if (e.message.includes("denied")) {
                    sdk.close(
                        RPCCloseCodes.CLOSE_ABNORMAL,
                        "User denied authorization. Unable to to authenticate with Discord.",
                    );
                }

                throw e;
            }

            log("Received code from Discord");

            const res = await fetch("/api/authorize", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    code,
                    guild_id: sdk.guildId,
                }),
            }).then((res) => res.json());

            log("Response received for Discord access token");

            if (!res.ok) {
                log(`Error: ${res.error}`, ConsoleLevel.ERROR);
                throw new Error(res.error);
            }

            const accessToken = res.data.access_token;
            const sessionToken = res.data.session_token;

            trpcAuthContext.sessionToken = sessionToken;
            trpcAuthContext.accessToken = accessToken;
            if (sdk.guildId) {
                trpcAuthContext.guildId = sdk.guildId;
            }

            const auth = await sdk.commands.authenticate({
                access_token: accessToken,
            });

            log("Authenticated with Discord");

            return auth;
        },
    });

    const updateActivity: DiscordContextValue["updateActivity"] = async (
        activity = {},
    ) => {
        if (activity) {
            activityRef.current = {
                ...activityRef.current,
                ...activity,
            };
        }

        await sdk.commands.setActivity({
            activity: {
                state: activityRef.current.title,
                details: activityRef.current.details,
                timestamps: {
                    start: loadedAtRef.current,
                },
                assets: {
                    large_image: "logo",
                },
                party: activityRef.current.party
                    ? {
                          id: "party",
                          size: activityRef.current.party,
                      }
                    : {},
                secrets: {
                    match: "match",
                    join: "join",
                },
            },
        });
    };

    useEffect(() => {
        if (!authenticateQuery.isLoading && !authenticateQuery.error) {
            updateActivity();

            sdk.commands.encourageHardwareAcceleration();
        }
    }, [authenticateQuery, sdk.commands]);

    const inviteBot = async () => {
        const url = new URL(
            Routes.oauth2Authorization(),
            "https://discord.com/api",
        );

        url.searchParams.set(
            "client_id",
            process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID as string,
        );
        url.searchParams.set("permissions", "1175918193181741057");
        url.searchParams.set("scope", "bot applications.commands");
        url.searchParams.set("guild_id", sdk.guildId as string);

        await sdk.commands.openExternalLink({ url: url.toString() });
    };

    return (
        <DiscordContext.Provider
            value={{
                loading: authenticateQuery.isLoading,
                sdk,
                auth: authenticateQuery.data,

                updateActivity,
                inviteBot,
            }}
        >
            {authenticateQuery.isLoading && !authenticateQuery.error && (
                <div className="bg-pattern-topography relative flex h-screen w-screen flex-col items-center justify-center gap-2 p-3">
                    <p>Connecting to Discord...</p>
                    <Loader />
                </div>
            )}

            {authenticateQuery.error && (
                <div className="bg-pattern-error relative flex h-screen w-screen flex-col items-center justify-center gap-2 p-3">
                    <p>Failed to authorize with Discord</p>
                    <p>{authenticateQuery.error.message}</p>
                </div>
            )}

            {!authenticateQuery.isLoading &&
                !authenticateQuery.error &&
                children}
        </DiscordContext.Provider>
    );
}
