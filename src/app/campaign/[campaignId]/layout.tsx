import { Hydrate } from "@tanstack/react-query";
import { redirect } from "next/navigation";

import { getTRPCServerHelpers } from "@/app/api/lib/server/getTRPCServerHelpers";
import { stripNonJSONProps } from "@/app/lib/stripNonJSONProps";

export default async function CampaignLayout({
    children,
    params: { campaignId },
}) {
    const helpers = await getTRPCServerHelpers();

    const user = await helpers.user.me.fetch();

    if (!user) {
        redirect(
            `/login?redirectUri=${encodeURIComponent(
                `/campaign/${campaignId}`,
            )}`,
        );
    }

    await helpers.campaign.get.prefetch(campaignId);
    await helpers.campaignMember.list.prefetch({
        campaignId,
    });

    return (
        <Hydrate state={stripNonJSONProps(helpers.dehydrate())}>
            {children}
        </Hydrate>
    );
}
