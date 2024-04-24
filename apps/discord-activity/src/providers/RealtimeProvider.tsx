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
        if (!user.authenticated || !realtimeTokenQuery.data) {
            return null;
        }

        return new Pubnub({
            subscribeKey: process.env.NEXT_PUBLIC_PUBNUB_SUBKEY as string,
            userId: user.id,
            origin:
                process.env.NEXT_PUBLIC_BASE_URL!.split("/").pop() + "/pubnub",
            authKey: realtimeTokenQuery.data.token,
            keepAlive: true,
        });
    }, [realtimeTokenQuery.data, user.authenticated, user.id]);

    useEffect(() => {
        if (!pubnubClient || !realtimeTokenQuery.data) return;

        pubnubClient.subscribe({
            channels: realtimeTokenQuery.data.channels,
            withPresence: true,
        });
    }, [pubnubClient, realtimeTokenQuery.data]);

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
