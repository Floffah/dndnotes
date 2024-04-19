"use client";

import { PropsWithChildren, createContext, useContext, useEffect } from "react";

import { useRealtime } from "@/providers/RealtimeProvider";

interface GuildContextValue {}

export const GuildContext = createContext<GuildContextValue>(null!);

export const useGuild = () => useContext(GuildContext);

export function GuildProvider({ children }: PropsWithChildren) {
    const realtime = useRealtime();

    return <GuildContext.Provider value={{}}>{children}</GuildContext.Provider>;
}
