"use client";

import { PropsWithChildren, createContext, useContext } from "react";

import { CampaignAPIModel, CampaignError } from "@dndnotes/models";
import { CampaignFilter } from "@dndnotes/models";

import { api } from "@/lib/api";

export interface GuildCampaignsContextValue {
    loading: boolean;
    campaigns: CampaignAPIModel[];

    linkCampaign(campaignId: string): Promise<void>;
}

export const GuildCampaignsContext = createContext<GuildCampaignsContextValue>(
    null!,
);

export const useGuildCampaigns = () => useContext(GuildCampaignsContext);

export function GuildCampaignsProvider({ children }: PropsWithChildren) {
    const guildCampaigns = api.campaign.list.useQuery(
        {
            filter: CampaignFilter.GUILD_LINKED,
        },
        {
            retry: false,
        },
    );

    const linkCampaignMutation = api.campaign.linkGuild.useMutation();

    let campaigns = guildCampaigns.data ?? [];

    if (
        guildCampaigns.error &&
        guildCampaigns.error.message === CampaignError.GUILD_NOT_FOUND
    ) {
        campaigns = [];
    }

    const linkCampaign = async (campaignId: string) => {
        await linkCampaignMutation.mutateAsync({
            campaignId,
        });

        await guildCampaigns.refetch();
    };

    return (
        <GuildCampaignsContext.Provider
            value={{
                loading: guildCampaigns.isLoading,
                campaigns,

                linkCampaign,
            }}
        >
            {children}
        </GuildCampaignsContext.Provider>
    );
}
