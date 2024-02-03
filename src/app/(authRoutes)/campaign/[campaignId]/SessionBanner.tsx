import { formatDistance, formatRelative } from "date-fns";
import Link from "next/link";
import { useMemo } from "react";

import { StartSessionDialog } from "@/app/(authRoutes)/campaign/[campaignId]/StartSessionDialog";
import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import { Loader } from "@/app/components/Loader";
import { Tooltip } from "@/app/components/Tooltip";
import { useCampaign } from "@/app/providers/CampaignProvider";
import { CampaignMemberType } from "@/db/enums/CampaignMemberType";
import { CampaignSessionSchedule } from "@/db/models/CampaignSessionSchedule";

function NextSession() {
    const campaign = useCampaign();

    const nextSchedule = useMemo(() => {
        let schedule: CampaignSessionSchedule | null = null;

        for (const s of campaign.schedules) {
            if (
                s.nextSessionAt &&
                (!schedule ||
                    s.nextSessionAt.getTime() <
                        schedule.nextSessionAt.getTime())
            ) {
                schedule = s;
            }
        }

        return schedule;
    }, [campaign]);

    if (!nextSchedule) {
        return (
            <>
                <Icon
                    icon="mdi:clock-alert-outline"
                    className="text-red-300"
                    label="no schedule"
                />

                <span className="text-lg font-semibold">Next session at:</span>

                {campaign.currentMember?.type === CampaignMemberType.DM && (
                    <>
                        You haven&apos;t created a session schedule yet!
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

    if (
        nextSchedule.nextSessionAt &&
        nextSchedule.length &&
        Date.now() > nextSchedule.nextSessionAt.getTime() &&
        Date.now() - nextSchedule.nextSessionAt.getTime() < nextSchedule.length
    ) {
        return (
            <>
                <Icon
                    icon="mdi:alarm"
                    className="text-red-300"
                    label="start session"
                />
                <span className="text-lg font-semibold">
                    It&apos;s time for{" "}
                    {nextSchedule.repeat ? "the next session in" : ""}{" "}
                    {nextSchedule.name}!
                </span>
                {campaign.currentMember?.type === CampaignMemberType.DM && (
                    <StartSessionDialog schedule={nextSchedule}>
                        <Button size="sm" color="primary">
                            Start Session
                        </Button>
                    </StartSessionDialog>
                )}
                {campaign.currentMember?.type !== CampaignMemberType.DM && (
                    <span>Waiting for your DM to start the session...</span>
                )}

                <span className="text-xs uppercase text-white/60">
                    (Started{" "}
                    {formatDistance(nextSchedule.nextSessionAt, new Date(), {
                        addSuffix: true,
                    })}
                    )
                </span>
            </>
        );
    }

    return (
        <>
            <Icon icon="mdi:clock-outline" label="session soon" />
            <span className="text-lg font-semibold">Next session at:</span>
            <Tooltip
                title={Intl.DateTimeFormat("en-GB", {
                    dateStyle: "long",
                    timeStyle: "short",
                }).format(nextSchedule.nextSessionAt)}
                side="bottom"
            >
                <span className="indicate-action indicate-white/50">
                    {formatRelative(nextSchedule.nextSessionAt, new Date())}
                </span>
            </Tooltip>
        </>
    );
}

export function SessionBanner() {
    const campaign = useCampaign();

    if (!campaign.loading && campaign.schedules.length === 0) {
        return (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                No session schedules have been set up yet!
            </div>
        );
    }

    return (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
            {campaign.loading ? (
                <Loader className="h-5 w-5 text-white/50" />
            ) : (
                <NextSession />
            )}
        </div>
    );
}
