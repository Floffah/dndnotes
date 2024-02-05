"use client";

import { PropsWithChildren, createContext, useContext } from "react";

import { trpc } from "@/app/api/lib/client/trpc";
import { CampaignSession } from "@/db/models/CampaignSession";

export interface CampaignSessionContextValue extends CampaignSession {
    loading: boolean;
}

export const CampaignSessionContext =
    createContext<CampaignSessionContextValue>(null!);

export const useCampaignSession = () => useContext(CampaignSessionContext);

export function CampaignSessionProvider({
    campaignId,
    sessionId,
    children,
}: PropsWithChildren<{
    campaignId: string;
    sessionId: string;
}>) {
    const session = trpc.campaign.session.get.useQuery({
        campaignId,
        sessionId,
    });

    return (
        <CampaignSessionContext.Provider
            value={{
                loading: session.isLoading,
                ...(session.data ?? ({} as CampaignSession)),
            }}
        >
            {children}
        </CampaignSessionContext.Provider>
    );
}
