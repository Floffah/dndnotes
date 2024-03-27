"use client";

import { DiscordSDK, patchUrlMappings } from "@discord/embedded-app-sdk";
import { useQuery } from "@tanstack/react-query";
import {
    createContext,
    useContext,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";

import { Loader } from "@dndnotes/components";

import { api } from "@/lib/api";

interface MutableActivity {
    title: string;
    details: string;
    party: [number, number];
}

interface DiscordContextValue {
    loading: boolean;
    sdk: DiscordSDK;
    auth?: Awaited<ReturnType<DiscordSDK["commands"]["authenticate"]>>;

    updateActivity: (activity?: Partial<MutableActivity>) => Promise<void>;
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

export function DiscordProvider({ children }) {
    const [sdk] = useState(
        () =>
            new DiscordSDK(process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID as string),
    );

    const loadedAtRef = useRef(Date.now());
    const activityRef = useRef<MutableActivity>({
        title: "Not in a session",
        details: "Idling",
        party: [1, 1],
    });

    const log = (message: string, level: ConsoleLevel = ConsoleLevel.DEBUG) =>
        sdk.commands.captureLog({ message, level });

    const authenticateQuery = useQuery({
        queryKey: ["discord", "authenticate", "embedded_app_sdk"],
        queryFn: async () => {
            patchUrlMappings([
                {
                    prefix: "/dndnotes",
                    target: process.env.NEXT_PUBLIC_API_DOMAIN as string,
                },
            ]);

            await sdk.ready();

            const { code } = await sdk.commands.authorize({
                client_id: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID as string,
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
            api.setHeader("X-Access-Token", accessToken);

            return await sdk.commands.authenticate({
                access_token: accessToken,
            });
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
                party: activityRef.current.party
                    ? {
                          id: "party",
                          size: activityRef.current.party,
                      }
                    : null,
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
        }
    }, [authenticateQuery, sdk.commands]);

    return (
        <DiscordContext.Provider
            value={{
                loading: authenticateQuery.isLoading,
                sdk,
                auth: authenticateQuery.data,

                updateActivity,
            }}
        >
            {authenticateQuery.isLoading ? (
                <div className="bg-pattern-random relative flex h-screen w-screen flex-col items-center justify-center gap-2 p-3">
                    <p>Connecting to Discord...</p>
                    <Loader />
                </div>
            ) : (
                children
            )}
        </DiscordContext.Provider>
    );
}
