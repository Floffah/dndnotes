import { Metadata, ResolvedMetadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

import { getTRPCServerHelpers } from "@/app/lib/api/trpc/getTRPCServerHelpers";
import { populateMetadata } from "@/app/lib/populateMetadata";
import { CampaignProvider } from "@/app/providers/CampaignProvider";
import { ServerHydrationBoundary } from "@/app/providers/ServerHydrationBoundary";
import { Campaign } from "@/db/models/Campaign";
import { CampaignError } from "@/db/models/Campaign/error";

export async function generateMetadata(
    { params: { campaignId } },
    parent: ResolvingMetadata,
): Promise<Metadata | ResolvedMetadata> {
    const helpers = await getTRPCServerHelpers();

    let campaign: Campaign;

    try {
        campaign = await helpers.campaign.get.fetch(campaignId);
    } catch (e: any) {
        return await parent;
    }

    return populateMetadata({
        title: campaign.name,
        description: `View the campaign ${campaign.name}, hosted by ${campaign.createdBy?.name} on Floffah's DND Notes!`,
    });
}

export default async function CampaignLayout({
    children,
    params: { campaignId },
}) {
    const helpers = await getTRPCServerHelpers();

    try {
        await helpers.campaign.get.fetch(campaignId);
    } catch (e: any) {
        switch (e.message) {
            case CampaignError.NOT_FOUND:
                return notFound();
        }
    }

    await helpers.campaign.member.list.prefetch({
        campaignId,
    });

    await helpers.campaign.session.list.prefetch({
        campaignId,
    });

    return (
        <ServerHydrationBoundary helpers={helpers}>
            <CampaignProvider campaignId={campaignId}>
                {children}
            </CampaignProvider>
        </ServerHydrationBoundary>
    );
}
