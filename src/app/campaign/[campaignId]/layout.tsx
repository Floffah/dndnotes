import { Metadata, ResolvedMetadata, ResolvingMetadata } from "next";

import { getTRPCServerHelpers } from "@/app/api/lib/server/getTRPCServerHelpers";
import { populateMetadata } from "@/app/lib/populateMetadata";
import { serializableClone } from "@/app/lib/serializableClone";
import { CampaignProvider } from "@/app/providers/CampaignProvider";
import { Hydrate } from "@/app/providers/Hydrate";

export async function generateMetadata(
    { params: { campaignId } },
    parent: ResolvingMetadata,
): Promise<Metadata | ResolvedMetadata> {
    const helpers = await getTRPCServerHelpers();

    const campaign = await helpers.campaign.get.fetch(campaignId);

    if (!campaign) {
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

    await helpers.campaign.get.fetch(campaignId);
    await helpers.campaign.member.list.prefetch({
        campaignId,
    });

    return (
        <Hydrate state={serializableClone(helpers.dehydrate())}>
            <CampaignProvider campaignId={campaignId}>
                {children}
            </CampaignProvider>
        </Hydrate>
    );
}
