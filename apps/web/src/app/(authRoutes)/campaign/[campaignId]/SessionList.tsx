import { format, formatDistance } from "date-fns";
import Link from "next/link";

import { Button, Card, Icon, Tooltip } from "@dndnotes/components";

import { StartSessionDialog } from "@/app/(authRoutes)/campaign/[campaignId]/StartSessionDialog";
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
                                label="add"
                                icon="mdi:plus"
                                className="h-5 w-5"
                            />
                            <p className="text-lg font-semibold">
                                Start a session
                            </p>
                        </div>
                    </StartSessionDialog>

                    {campaign.sessions.map((session) => (
                        <Card key={session.id} asChild color="default">
                            <Link
                                href={`/campaign/${campaign.id}/session/${session.id}`}
                            >
                                <Card.Title>{session.name}</Card.Title>
                                <Tooltip
                                    title={format(session.startedAt, "PPPp")}
                                >
                                    <Card.Subtitle className="indicate-action indicate-white/50">
                                        {formatDistance(
                                            session.createdAt,
                                            new Date(),
                                            {
                                                addSuffix: true,
                                            },
                                        )}
                                    </Card.Subtitle>
                                </Tooltip>

                                <Card.Details>
                                    <Card.Details.Item
                                        icon="mdi:file-document-outline"
                                        label="session type"
                                    >
                                        {session.type.replace("_", " ")}
                                    </Card.Details.Item>
                                    <Card.Details.Item
                                        icon="mdi:calendar"
                                        label="scheduled type"
                                    >
                                        {session.schedule
                                            ? "SCHEDULED"
                                            : "NOT SCHEDULED"}
                                    </Card.Details.Item>
                                </Card.Details>
                            </Link>
                        </Card>
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
