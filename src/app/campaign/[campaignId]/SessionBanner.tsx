import { Icon } from "@iconify/react";
import { formatDistance, formatRelative } from "date-fns";
import Link from "next/link";

import { Button } from "@/app/components/Button";
import { Tooltip } from "@/app/components/Tooltip";
import { useCampaign } from "@/app/providers/CampaignProvider";
import { CampaignMemberType } from "@/db/enums/CampaignMemberType";

function NextSession() {
    const campaign = useCampaign();

    if (!campaign.schedule.nextSession) {
        return (
            <>
                <Icon icon="mdi:clock-alert-outline" className="text-red-300" />

                <span className="text-lg font-semibold">Next session at:</span>

                {campaign.currentMember?.type === CampaignMemberType.DM && (
                    <>
                        You haven&apos;t set a session time yet!
                        <Link
                            href={`/campaign/${campaign.id}/settings`}
                            className="text-blue-400 underline decoration-blue-400/75 underline-offset-2"
                        >
                            Set one
                        </Link>
                    </>
                )}
                {campaign.currentMember?.type !== CampaignMemberType.DM &&
                    "Your DM has not set a session time yet! Tell them to set one!"}
            </>
        );
    }

    // if session time was within the last 2 hours
    if (
        campaign.schedule.nextSession &&
        Date.now() > campaign.schedule.nextSession.getTime() &&
        Date.now() - campaign.schedule.nextSession.getTime() <
            2 * 60 * 60 * 1000
    ) {
        return (
            <>
                <Icon icon="mdi:alarm" className="text-red-300" />
                <span className="text-lg font-semibold">
                    It&apos;s time for session {campaign.totalSessions + 1}!
                </span>
                {campaign.currentMember?.type === CampaignMemberType.DM && (
                    <Button size="sm" color="primary">
                        Start Session
                    </Button>
                )}
                {campaign.currentMember?.type !== CampaignMemberType.DM && (
                    <span>Waiting for your DM to start the session...</span>
                )}

                <span className="text-xs uppercase text-white/60">
                    (Started{" "}
                    {formatDistance(campaign.schedule.nextSession, new Date(), {
                        addSuffix: true,
                    })}
                    )
                </span>
            </>
        );
    }

    return (
        <>
            <Icon icon="mdi:clock-outline" />
            <span className="text-lg font-semibold">Next session at:</span>
            <Tooltip
                title={Intl.DateTimeFormat("en-GB", {
                    dateStyle: "long",
                    timeStyle: "short",
                }).format(campaign.schedule.nextSession)}
                side="bottom"
            >
                <span className="indicate-action indicate-white/50">
                    {formatRelative(campaign.schedule.nextSession, new Date())}
                </span>
            </Tooltip>
        </>
    );
}

export function SessionBanner() {
    const campaign = useCampaign();

    return (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
            <NextSession />
        </div>
    );
}
