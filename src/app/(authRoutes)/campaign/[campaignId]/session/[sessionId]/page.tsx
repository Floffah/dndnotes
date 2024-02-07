"use client";

import { CampaignNavBar } from "@/app/(authRoutes)/campaign/[campaignId]/CampaignNavBar";
import { CampaignSessionSummary } from "@/app/(authRoutes)/campaign/[campaignId]/session/[sessionId]/CampaignSessionSummary";
import { LinkToNotionDialog } from "@/app/(authRoutes)/campaign/[campaignId]/session/[sessionId]/LinkToNotionDialog";
import { Button } from "@/app/components/Button";
import { useCampaignSession } from "@/app/providers/CampaignSessionProvider";

export default function CampaignSessionPage() {
    const session = useCampaignSession();

    return (
        <div className="flex h-full w-full flex-col gap-3 p-3">
            <CampaignNavBar session={session} />

            <div className="flex h-full gap-3">
                {session.summary ? (
                    <CampaignSessionSummary />
                ) : (
                    <div className="flex flex-auto flex-col items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                        <p className="text-lg font-semibold">
                            You have not created a summary for this session yet.
                        </p>
                        <LinkToNotionDialog>
                            <Button size="md" color="primary">
                                Link to Notion
                            </Button>
                        </LinkToNotionDialog>
                        <Button size="md" color="primary">
                            Create Summary
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
