"use client";

import { PropsWithChildren, createContext, useContext } from "react";

import { trpc } from "@/app/api/lib/client/trpc";
import { useUser } from "@/app/providers/UserProvider";
import { Campaign } from "@/db/models/Campaign";
import { CampaignMember } from "@/db/models/CampaignMember";

export interface CampaignContextValue extends Campaign {
    loading: boolean;
    members: CampaignMember[];
    currentMember: CampaignMember;
}

export const CampaignContext = createContext<CampaignContextValue>(null!);

export const useCampaign = () => useContext(CampaignContext);

export function CampaignProvider({
    campaignId,
    children,
}: PropsWithChildren<{ campaignId: string }>) {
    const user = useUser();

    const campaign = trpc.campaign.get.useQuery(campaignId);
    const campaignMembers = trpc.campaign.member.list.useQuery({
        campaignId,
    });

    const currentMember = campaignMembers.data?.find(
        (member) => member.user?.id === user.id,
    );

    return (
        <CampaignContext.Provider
            value={
                {
                    loading: campaign.isLoading || campaignMembers.isLoading,
                    ...(campaign.data ?? {}),
                    members: campaignMembers.data ?? [],
                    currentMember: currentMember ?? {},
                } as CampaignContextValue
            }
        >
            {children}
        </CampaignContext.Provider>
    );
}
