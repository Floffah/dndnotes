"use client";

import { Button } from "@dndnotes/components";

import { CampaignNavBar } from "@/app/(authRoutes)/campaign/[campaignId]/CampaignNavBar";
import { CampaignSessionSummary } from "@/app/(authRoutes)/campaign/[campaignId]/session/[sessionId]/CampaignSessionSummary";
import { LinkToNotionDialog } from "@/app/(authRoutes)/campaign/[campaignId]/session/[sessionId]/LinkToNotionDialog";
import { useCampaignSession } from "@/app/providers/CampaignSessionProvider";

export default function CampaignSessionPage() {
    const session = useCampaignSession();

    return (
        <div className="flex h-screen w-screen flex-col gap-3 p-3">
            <CampaignNavBar session={session} />

            <div className="flex min-h-0 flex-1 gap-3">
                <aside className="flex w-full max-w-[17rem] flex-col rounded-lg border border-white/10 bg-white/5"></aside>

                {session.summary ? (
                    <main className="flex-1 overflow-x-hidden overflow-y-scroll whitespace-nowrap rounded-lg border border-white/10 bg-white/5 p-3">
                        <CampaignSessionSummary />
                    </main>
                ) : (
                    <main className="flex flex-grow flex-col items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                        <p className="text-lg font-semibold">
                            You have not created a summary for this session yet.
                        </p>
                        <LinkToNotionDialog>
                            <Button size="md" color="primary">
                                Link to Notion
                            </Button>
                        </LinkToNotionDialog>
                        <Button
                            size="md"
                            color="primary"
                            onClick={() => session.initEmptySummary()}
                        >
                            Create Summary
                        </Button>
                    </main>
                )}
            </div>
        </div>
    );
}
