import { RedirectType, redirect } from "next/navigation";

import { CampaignError } from "@dndnotes/models";

import { getServerHelpers } from "@/lib/getServerHelpers";
import { ServerHydrationBoundary } from "@/providers/ServerHydrationBoundary";

export default async function CampaignDashboardLayout({
    children,
    params: { campaignId },
}) {
    const helpers = await getServerHelpers();

    try {
        await helpers.campaign.get.fetch(campaignId);
    } catch (e: any) {
        switch (e.message) {
            case CampaignError.NOT_FOUND:
                return redirect("/", RedirectType.push);
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
            {children}
        </ServerHydrationBoundary>
    );
}
