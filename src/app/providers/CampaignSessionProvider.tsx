"use client";

import { inferProcedureInput } from "@trpc/server";
import { PropsWithChildren, createContext, useContext } from "react";

import { trpc } from "@/app/api/lib/client/trpc";
import { CampaignSession } from "@/db/models/CampaignSession";
import { AppRouter } from "@/server/router";

export interface CampaignSessionContextValue extends CampaignSession {
    loading: boolean;

    updateSummary: (
        data: inferProcedureInput<
            AppRouter["campaign"]["session"]["updateSummary"]
        >,
    ) => Promise<void>;
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
    const utils = trpc.useUtils();

    const session = trpc.campaign.session.get.useQuery({
        campaignId,
        sessionId,
    });

    const updateSummaryMutation =
        trpc.campaign.session.updateSummary.useMutation();

    const updateSummary: CampaignSessionContextValue["updateSummary"] = async (
        data,
    ) => {
        const session = await updateSummaryMutation.mutateAsync(data);

        const existingSession = utils.campaign.session.get.getData({
            campaignId: data.campaignId,
            sessionId: data.sessionId,
        });

        utils.campaign.session.get.setData(
            {
                campaignId: data.campaignId,
                sessionId: data.sessionId,
            },
            {
                ...existingSession,
                ...session,
            },
        );
    };

    return (
        <CampaignSessionContext.Provider
            value={{
                loading: session.isLoading,
                ...(session.data ?? ({} as CampaignSession)),

                updateSummary,
            }}
        >
            {children}
        </CampaignSessionContext.Provider>
    );
}