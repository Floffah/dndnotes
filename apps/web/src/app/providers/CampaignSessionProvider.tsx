"use client";

import { PropsWithChildren, createContext, useContext } from "react";

import { InputTypes } from "@dndnotes/backend-framework";
import { CampaignSession } from "@dndnotes/models";
import { AppRouter } from "@dndnotes/server";

import { api } from "@/app/lib/api";
import defaultSessionDocument from "@/data/defaultSessionDocument.json";

export interface CampaignSessionContextValue extends CampaignSession {
    loading: boolean;

    updateSummary: (
        data: InputTypes<AppRouter>["campaign"]["session"]["updateSummary"],
    ) => Promise<void>;
    initEmptySummary: (opts?: {
        campaignId: string;
        sessionId: string;
    }) => Promise<void>;
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
    const cache = api.useCache();

    const session = api.campaign.session.get.useQuery({
        campaignId,
        sessionId,
    });

    const updateSummaryMutation =
        api.campaign.session.updateSummary.useMutation();

    const updateSummary: CampaignSessionContextValue["updateSummary"] = async (
        data,
    ) => {
        const session = await updateSummaryMutation.mutateAsync(data);

        const existingSession = cache.campaign.session.get.getData({
            campaignId: data.campaignId,
            sessionId: data.sessionId,
        });

        cache.campaign.session.get.setData(
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

    const initEmptySummary: CampaignSessionContextValue["initEmptySummary"] =
        async (
            opts = {
                campaignId,
                sessionId,
            },
        ) => {
            await updateSummary({
                campaignId: opts.campaignId,
                sessionId: opts.sessionId,
                richText: defaultSessionDocument,
            });
        };

    return (
        <CampaignSessionContext.Provider
            value={{
                loading: session.isPending,
                ...(session.data ?? ({} as CampaignSession)),

                updateSummary,
                initEmptySummary,
            }}
        >
            {children}
        </CampaignSessionContext.Provider>
    );
}
