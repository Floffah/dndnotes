import { Metadata, ResolvedMetadata, ResolvingMetadata } from "next";
import { notFound, redirect } from "next/navigation";

import { CampaignInviteError } from "@dndnotes/models";

import { getServerHelpers } from "@/app/lib/getServerHelpers";
import { CampaignInviteProvider } from "@/app/providers/CampaignInviteProvider";
import { ServerHydrationBoundary } from "@/app/providers/ServerHydrationBoundary";

export async function generateMetadata(
    { params: { campaignId, inviteCode } },
    parent: ResolvingMetadata,
): Promise<Metadata | ResolvedMetadata> {
    const helpers = await getServerHelpers();

    let invite;

    try {
        invite = await helpers.campaign.invite.get.fetch({
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
    const helpers = await getServerHelpers();

    try {
        await helpers.campaign.invite.get.fetch({
            campaignId,
            inviteCode,
        });
    } catch (e: any) {
        switch (e.message) {
            case CampaignInviteError.NOT_FOUND:
                return notFound();
            case CampaignInviteError.ALREADY_MEMBER:
                return redirect(`/campaign/${campaignId}`);
        }
    }

    return (
        <ServerHydrationBoundary helpers={helpers}>
            <CampaignInviteProvider
                campaignId={campaignId}
                inviteCode={inviteCode}
            >
                {children}
            </CampaignInviteProvider>
        </ServerHydrationBoundary>
    );
}
