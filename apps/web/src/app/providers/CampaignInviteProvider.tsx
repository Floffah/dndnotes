"use client";

import { CampaignInviteAPIModel } from "@dndnotes/models";
import { PropsWithChildren, createContext, useContext } from "react";

import { api } from "@/app/lib/api";

export interface CampaignInviteContextValue extends CampaignInviteAPIModel {
    loading: boolean;

    accept: () => Promise<void>;
}

export const CampaignInviteContext = createContext<CampaignInviteContextValue>(
    null!,
);

export const useCampaignInvite = () => useContext(CampaignInviteContext);

export function CampaignInviteProvider({
    campaignId,
    inviteCode,
    children,
}: PropsWithChildren<{
    campaignId: string;
    inviteCode: string;
}>) {
    const invite = api.campaign.invite.get.useQuery({
        campaignId,
        inviteCode,
    });

    const acceptMutation = api.campaign.invite.accept.useMutation();

    const accept: CampaignInviteContextValue["accept"] = async () => {
        await acceptMutation.mutateAsync({
            code: inviteCode,
        });
    };

    return (
        <CampaignInviteContext.Provider
            value={{
                ...(invite.data as CampaignInviteAPIModel),
                loading: invite.isPending,

                accept,
            }}
        >
            {children}
        </CampaignInviteContext.Provider>
    );
}
