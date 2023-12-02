"use client";

import { PropsWithChildren, createContext, useContext } from "react";

import { trpc } from "@/app/api/lib/client/trpc";
import { useUser } from "@/app/providers/UserProvider";
import {
    CampaignClientModel,
    CampaignClientType,
} from "@/db/models/Campaign/consumers";
import {
    CampaignMemberClientModel,
    CampaignMemberClientType,
} from "@/db/models/CampaignMember/consumers";

export interface CampaignContextValue extends CampaignClientType {
    loading: boolean;
    members: CampaignMemberClientType[];
    currentMember: CampaignMemberClientType;
}

export const CampaignContext = createContext<CampaignContextValue>(null!);

export const useCampaign = () => useContext(CampaignContext);

export function CampaignProvider({
    campaignId,
    children,
}: PropsWithChildren<{ campaignId: string }>) {
    const user = useUser();

    const campaign = trpc.campaign.get.useQuery(campaignId);
    const campaignMembers = trpc.campaignMember.list.useQuery({
        campaignId,
    });

    const currentMember = campaignMembers.data?.find(
        (member) => member.user.id === user.id,
    );

    let contextValue: Partial<CampaignContextValue> = {};

    contextValue.loading = campaign.isLoading || campaignMembers.isLoading;

    if (campaign.data) {
        contextValue = {
            ...contextValue,
            ...new CampaignClientModel(campaign.data!).toObject({
                currentUser: user,
                currentMember,
            }),
        };
    }

    if (campaignMembers.data) {
        contextValue.members = campaignMembers.data!.map(
            (member) => new CampaignMemberClientModel(member),
        );
        contextValue.currentMember = new CampaignMemberClientModel(
            currentMember!,
        ).toObject({
            currentUser: user,
            currentMember: currentMember!,
        });
    }

    return (
        <CampaignContext.Provider value={contextValue as CampaignContextValue}>
            {children}
        </CampaignContext.Provider>
    );
}
