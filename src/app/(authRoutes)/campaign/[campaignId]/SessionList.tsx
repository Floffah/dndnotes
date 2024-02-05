import { addDays, format, formatDistance, formatRelative } from "date-fns";
import Link from "next/link";

import { StartSessionDialog } from "@/app/(authRoutes)/campaign/[campaignId]/StartSessionDialog";
import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import { Tooltip } from "@/app/components/Tooltip";
import { useCampaign } from "@/app/providers/CampaignProvider";

export function SessionList() {
    const campaign = useCampaign();

    return (
        <div className="w-full flex-col">
            <div className="flex items-center">
                <p className="flex-1 text-lg font-semibold">Sessions</p>
            </div>
            {campaign.sessions.length > 0 ? (
                <div className="mt-1 grid w-full grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                    <StartSessionDialog>
                        <div className="flex h-full w-full cursor-pointer items-center justify-center gap-1 rounded-lg border border-dashed border-white/10 p-3">
                            <Icon
                                label="add icon"
                                icon="mdi:plus"
                                className="h-5 w-5"
                            />
                            <p className="text-lg font-semibold">
                                Start a session
                            </p>
                        </div>
                    </StartSessionDialog>

                    {campaign.sessions.map((session) => (
                        <Link
                            href={`/campaign/${campaign.id}/session/${session.id}`}
                            key={session.id}
                            className="flex w-full flex-col gap-1.5 rounded-lg border border-white/10 p-3"
                        >
                            <p className="text-lg font-semibold">
                                {session.name}
                            </p>
                            <Tooltip title={format(session.startedAt, "PPPp")}>
                                <p className="indicate-action -mt-2 text-sm text-white/75 indicate-white/50">
                                    {formatDistance(
                                        session.createdAt,
                                        new Date(),
                                        {
                                            addSuffix: true,
                                        },
                                    )}
                                </p>
                            </Tooltip>
                            <div className="flex w-full gap-2 text-xs text-white/50">
                                <p className="flex items-center gap-1">
                                    <Icon
                                        label="session type"
                                        icon="mdi:file-document-outline"
                                    />
                                    <span>
                                        {session.type.replace("_", " ")}
                                    </span>
                                </p>
                                <p className="flex items-center gap-1">
                                    <Icon
                                        label="scheduled type"
                                        icon="mdi:calendar"
                                    />
                                    <span>
                                        {session.schedule
                                            ? "SCHEDULED"
                                            : "NOT SCHEDULED"}
                                    </span>
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-10">
                    <p className="font-semibold">
                        This campaign has held no sessions yet!
                    </p>

                    <StartSessionDialog>
                        <Button size="sm" color="primary" icon="mdi:plus">
                            Start Session
                        </Button>
                    </StartSessionDialog>
                </div>
            )}
        </div>
    );
}
