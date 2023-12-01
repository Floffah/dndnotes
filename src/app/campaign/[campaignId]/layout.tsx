import { Hydrate } from "@tanstack/react-query";

import { getTRPCServerHelpers } from "@/app/api/lib/server/getTRPCServerHelpers";
import { stripNonJSONProps } from "@/app/lib/stripNonJSONProps";

export default async function CampaignLayout({
    children,
    params: { campaignId },
}) {
    const helpers = await getTRPCServerHelpers();

    await helpers.campaign.get.prefetch(campaignId);

    return (
        <Hydrate state={stripNonJSONProps(helpers.dehydrate())}>
            {children}
        </Hydrate>
    );
}
