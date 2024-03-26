import { Metadata, ResolvedMetadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

import { CampaignSession, CampaignSessionError } from "@dndnotes/models";

import { getServerHelpers } from "@/app/lib/getServerHelpers";
import { populateMetadata } from "@/app/lib/populateMetadata";
import { CampaignSessionProvider } from "@/app/providers/CampaignSessionProvider";
import { ServerHydrationBoundary } from "@/app/providers/ServerHydrationBoundary";

export async function generateMetadata(
    { params: { campaignId, sessionId } },
    parent: ResolvingMetadata,
): Promise<Metadata | ResolvedMetadata> {
    const helpers = await getServerHelpers();

    let session: CampaignSession;

    try {
        session = await helpers.campaign.session.get.fetch({
            campaignId,
            sessionId,
        });
    } catch (e: any) {
        return await parent;
    }

    return populateMetadata({
        title: session.name + " | " + session.campaign.name,
        description: `View the campaign session ${session.name} on Floffah's DND Notes!`,
    });
}

export default async function CampaignSessionLayout({
    children,
    params: { campaignId, sessionId },
}) {
    const helpers = await getServerHelpers();

    try {
        await helpers.campaign.session.get.fetch({
            campaignId,
            sessionId,
        });
    } catch (e: any) {
        switch (e.message) {
            case CampaignSessionError.NOT_FOUND:
                return notFound();
        }
    }

    return (
        <ServerHydrationBoundary helpers={helpers}>
            <CampaignSessionProvider
                campaignId={campaignId}
                sessionId={sessionId}
            >
                {children}
            </CampaignSessionProvider>
        </ServerHydrationBoundary>
    );
}
