"use client";

import { MembersList } from "@/app/campaign/[campaignId]/MembersList";
import { NoCampaignPermissionDialog } from "@/app/campaign/[campaignId]/NoCampaignPermissionDialog";
import { useCampaign } from "@/app/providers/CampaignProvider";
import { useUser } from "@/app/providers/UserProvider";

export default function CampaignPage() {
    const user = useUser();
    const campaign = useCampaign();

    if (
        !campaign.loading &&
        !campaign.members.some((member) => member.user.id === user.id)
    ) {
        return <NoCampaignPermissionDialog open={true} />;
    }

    return (
        <div className="flex h-full w-full flex-col gap-3 p-3">
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-2">
                <p className="text-lg font-semibold">{campaign.name}</p>
                <p className="text-sm text-white/80">
                    by {campaign.createdBy?.name}
                </p>
            </div>

            <div className="flex h-full">
                <div className="flex-auto" />
                <MembersList campaign={campaign} />
            </div>
        </div>
    );
}
