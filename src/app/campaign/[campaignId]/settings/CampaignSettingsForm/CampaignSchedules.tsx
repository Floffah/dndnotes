import { formatDate, formatDuration, formatRelative } from "date-fns";

import { trpc } from "@/app/api/lib/client/trpc";
import { AddScheduleDialog } from "@/app/campaign/[campaignId]/settings/CampaignSettingsForm/AddScheduleDialog";
import { Icon } from "@/app/components/Icon";
import { Tooltip } from "@/app/components/Tooltip";
import { useCampaign } from "@/app/providers/CampaignProvider";

export function CampaignSchedules() {
    const campaign = useCampaign();

    const schedules = trpc.campaign.session.getSchedules.useQuery({
        campaignId: campaign.id,
    });

    return (
        <>
            <h2 className="mb-3 mt-5 border-b-2 border-b-white/20 text-2xl font-semibold">
                Schedules
            </h2>

            <div className="flex flex-col gap-2">
                {schedules.data?.map((schedule) => {
                    const infos = [
                        ["mdi:book", schedule.type],
                        [
                            "mdi:clock",
                            formatDuration(
                                schedule.length < 60 * 60 * 1000
                                    ? {
                                          minutes: schedule.length / 1000 / 60,
                                      }
                                    : {
                                          hours:
                                              schedule.length / 1000 / 60 / 60,
                                      },
                            ),
                        ],
                        [
                            "mdi:calendar",
                            schedule.repeat ? schedule.repeat : "No repeat",
                        ],
                    ];

                    return (
                        <div
                            key={schedule.id}
                            className="rounded-lg border-2 border-white/10 p-2"
                        >
                            <div className="flex items-center gap-2">
                                <p className="text-lg font-semibold">
                                    {schedule.name}
                                </p>
                                <p className="text-sm text-white/80">&bull;</p>
                                <Tooltip
                                    title={formatRelative(
                                        schedule.nextSessionAt,
                                        new Date(),
                                    )}
                                >
                                    <p className="indicate-action text-sm text-white/80 indicate-white/50">
                                        {formatDate(
                                            schedule.nextSessionAt,
                                            "PPPPp",
                                        )}
                                    </p>
                                </Tooltip>
                            </div>

                            <div className="flex gap-2">
                                {infos.map(([icon, text], index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-0.5 text-xs font-semibold uppercase text-white/60"
                                    >
                                        <Icon
                                            label={icon.split(":")[1]}
                                            icon={icon}
                                        />
                                        <p>{text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                <AddScheduleDialog>
                    <button
                        type="button"
                        className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-white/10 p-2 text-lg font-semibold text-white/70"
                    >
                        <Icon label="add" icon="mdi:plus" className="h-5 w-5" />
                        Add Schedule
                    </button>
                </AddScheduleDialog>
            </div>
        </>
    );
}
