"use client";

import Pubnub from "pubnub";
import {
    PropsWithChildren,
    createContext,
    useContext,
    useEffect,
    useMemo,
} from "react";

import { api } from "@/lib/api";
import { useUser } from "@/providers/UserProvider";

interface RealtimeContextValue {
    authenticated: boolean;
}

export const RealtimeContext = createContext<RealtimeContextValue>(null!);

export const useRealtime = () => useContext(RealtimeContext);

export function RealtimeProvider({ children }: PropsWithChildren) {
    const user = useUser();

    const realtimeTokenQuery = api.user.getRealtimeToken.useQuery();

    const pubnubClient = useMemo(() => {
        if (!user.authenticated) {
            return null;
        }

        const client = new Pubnub({
            subscribeKey: process.env.NEXT_PUBLIC_PUBNUB_SUBKEY as string,
            userId: user.id,
            origin:
                process.env.NEXT_PUBLIC_BASE_URL!.split("/").pop() + "/pubnub",
        });

        // prevent race conditions
        if (realtimeTokenQuery.data?.token) {
            client.setToken(realtimeTokenQuery.data.token);
        }

        return client;
    }, [user.authenticated, user.id]);

    useEffect(() => {
        if (!pubnubClient) return;

        if (pubnubClient.getUUID() !== user.id) {
            pubnubClient.setUUID(user.id);
        }
    }, [pubnubClient, user.id]);

    useEffect(() => {
        if (!pubnubClient) return;

        if (realtimeTokenQuery.data?.token) {
            pubnubClient.subscribe({
                channels: realtimeTokenQuery.data.channels,
            });

            pubnubClient.setToken(realtimeTokenQuery.data.token);
        }
    }, [pubnubClient, realtimeTokenQuery.data?.token]);

    return (
        <RealtimeContext.Provider
            value={{
                authenticated: !!pubnubClient && !!pubnubClient.getToken(),
            }}
        >
            {children}
        </RealtimeContext.Provider>
    );
}
