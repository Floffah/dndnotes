"use client";

import { PropsWithChildren, createContext, useContext } from "react";

import { DiscordActivityFeatureFlags } from "@dndnotes/server";

import { api } from "@/lib/api";

interface FeaturesContextValue {
    loading: boolean;
    discord: DiscordActivityFeatureFlags[];
}

export const FeaturesContext = createContext<FeaturesContextValue>(null!);

export const useFeatures = () => useContext(FeaturesContext);

export function FeaturesProvider({ children }: PropsWithChildren) {
    const discordFeatures = api.activities.getFeatures.useQuery();

    return (
        <FeaturesContext.Provider
            value={{
                loading: discordFeatures.isLoading,
                discord: discordFeatures.data ?? [],
            }}
        >
            {children}
        </FeaturesContext.Provider>
    );
}
