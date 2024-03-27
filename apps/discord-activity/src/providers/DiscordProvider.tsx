"use client";

import { DiscordSDK } from "@discord/embedded-app-sdk";
// @ts-ignore
import type { ConsoleLevel } from "@discord/embedded-app-sdk/output/utils/console";
import { useQuery } from "@tanstack/react-query";
import {
    createContext,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";

import { Loader } from "@dndnotes/components";

import { api } from "@/lib/api";

interface DiscordContextValue {
    loading: boolean;
    sdk: DiscordSDK;
    auth?: Awaited<ReturnType<DiscordSDK["commands"]["authenticate"]>>;
}

export const DiscordContext = createContext<DiscordContextValue>(null!);

export function DiscordProvider({ children }) {
    const [sdk] = useState(
        () =>
            new DiscordSDK(process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID as string),
    );

    const log = (message: string, level: ConsoleLevel = "debug") =>
        sdk.commands.captureLog({ message, level });

    const authenticateQuery = useQuery({
        queryKey: [
            "ESCAPE_MAIN",
            "authenticate",
            "discord",
            "embedded_app_sdk",
        ],
        queryFn: async () => {
            await sdk.ready();

            const { code } = await sdk.commands.authorize({
                client_id: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID as string,
                response_type: "code",
                state: "",
                prompt: "none",
                scope: [
                    "identify",
                    "email",
                    "guilds",
                    "guilds.members.read",
                    "rpc.activities.write",
                ],
            });

            log("Received code from Discord");

            const res = await fetch("/api/authorize", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    code,
                }),
            }).then((res) => res.json());

            if (!res.ok) {
                throw new Error(res.error);
            }

            const accessToken = res.data.access_token;
            const sessionToken = res.data.session_token;

            api.setHeader("X-Session-Token", sessionToken);

            return await sdk.commands.authenticate({
                access_token: accessToken,
            });
        },
    });

    useEffect(() => {
        if (!authenticateQuery.isLoading && !authenticateQuery.error) {
            sdk.commands.setActivity({
                activity: {
                    state: "Not in a session",
                    details: "Idling",
                    timestamps: {
                        start: Date.now(),
                    },
                    party: {
                        id: "party",
                        size: [1, 1],
                    },
                    secrets: {
                        match: "match",
                        join: "join",
                    },
                },
            });
        }
    }, [authenticateQuery, sdk.commands]);

    return (
        <DiscordContext.Provider
            value={{
                loading: authenticateQuery.isLoading,
                sdk,
                auth: authenticateQuery.data,
            }}
        >
            {authenticateQuery.isLoading ? (
                <div className="relative flex h-screen w-screen flex-col items-center justify-center gap-2 p-3">
                    <p>Connecting to Discord...</p>
                    <Loader />
                </div>
            ) : (
                children
            )}
        </DiscordContext.Provider>
    );
}
