"use client";

import { CampaignNavBar } from "@/app/(authRoutes)/campaign/[campaignId]/CampaignNavBar";
import { MembersList } from "@/app/(authRoutes)/campaign/[campaignId]/MembersList";
import { NoCampaignPermissionDialog } from "@/app/(authRoutes)/campaign/[campaignId]/NoCampaignPermissionDialog";
import { SessionBanner } from "@/app/(authRoutes)/campaign/[campaignId]/SessionBanner";
import { SessionList } from "@/app/(authRoutes)/campaign/[campaignId]/SessionList";
import { Divider } from "@/app/components/Divider";
import { Loader } from "@/app/components/Loader";
import { useCampaign } from "@/app/providers/CampaignProvider";
import { useUser } from "@/app/providers/UserProvider";

export default function CampaignPage() {
    const user = useUser();
    const campaign = useCampaign();

    if (
        !user.loading &&
        !user.authenticated &&
        !campaign.loading &&
        !campaign.currentMember
    ) {
        return <NoCampaignPermissionDialog open={true} />;
    }

    return (
        <div className="relative flex h-screen w-screen flex-col gap-3 p-3">
            <CampaignNavBar />

            <div className="flex h-full gap-3">
                {campaign.loading ? (
                    <main className="flex h-full w-full flex-auto items-center justify-center">
                        <Loader className="h-8 w-8 text-white/50" />
                    </main>
                ) : (
                    <main className="flex flex-auto flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                        <SessionBanner />
                        <SessionList />

                        <Divider />
                    </main>
                )}

                <MembersList campaign={campaign} />
            </div>
        </div>
    );
}
