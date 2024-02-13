import { Metadata, ResolvedMetadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

import { getTRPCServerHelpers } from "@/app/api/lib/server/getTRPCServerHelpers";
import { CampaignInviteProvider } from "@/app/providers/CampaignInviteProvider";
import { DehydrateServerQueryHelpers } from "@/app/providers/DehydrateServerQueryHelpers";
import { CampaignInviteError } from "@/db/models/CampaignInvite/error";

export async function generateMetadata(
    { params: { campaignId, inviteCode } },
    parent: ResolvingMetadata,
): Promise<Metadata | ResolvedMetadata> {
    const helpers = await getTRPCServerHelpers();

    let invite;

    try {
        invite = await helpers.campaign.member.getInvite.fetch({
            campaignId,
            inviteCode,
        });
    } catch (e: any) {
        return await parent;
    }

    return {
        title: "Join " + invite.campaign.name,
        description: `Join the campaign ${invite.campaign.name} on Floffah's DND Notes!`,
    };
}

export default async function CampaignJoinPageLayout({
    children,
    params: { campaignId, inviteCode },
}) {
    const helpers = await getTRPCServerHelpers();

    try {
        await helpers.campaign.member.getInvite.fetch({
            campaignId,
            inviteCode,
        });
    } catch (e: any) {
        switch (e.message) {
            case CampaignInviteError.NOT_FOUND:
                return notFound();
        }
    }

    return (
        <DehydrateServerQueryHelpers helpers={helpers}>
            <CampaignInviteProvider
                campaignId={campaignId}
                inviteCode={inviteCode}
            >
                {children}
            </CampaignInviteProvider>
        </DehydrateServerQueryHelpers>
    );
}
