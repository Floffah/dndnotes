"use client";

import { PropsWithChildren, createContext, useContext } from "react";

import { trpc } from "@/app/lib/api/trpc";
import { CampaignInviteAPIModel } from "@/db/models/CampaignInvite/consumers";

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
    const invite = trpc.campaign.invite.get.useQuery({
        campaignId,
        inviteCode,
    });

    const acceptMutation = trpc.campaign.invite.accept.useMutation();

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
