"use client";

import { trpc } from "@/app/api/lib/client/trpc";
import { NoCampaignPermissionDialog } from "@/app/campaign/[campaignId]/NoCampaignPermissionDialog";
import { useUser } from "@/app/providers/UserProvider";

export default function CampaignPage({ params: { campaignId } }) {
    const user = useUser();

    const campaign = trpc.campaign.get.useQuery(campaignId);
    const campaignMembers = trpc.campaignMember.list.useQuery({
        campaignId,
    });

    if (
        campaignMembers.data &&
        !campaignMembers.data.some((member) => member.user.id === user.id)
    ) {
        return <NoCampaignPermissionDialog open={true} />;
    }

    return (
        <div className="flex w-full flex-col p-3">
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-2">
                <p className="text-lg font-semibold">{campaign.data?.name}</p>
                <p className="text-sm text-white/80">
                    by {campaign.data?.createdBy?.name}
                </p>
            </div>
        </div>
    );
}
