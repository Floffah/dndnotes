"use client";

import clsx from "clsx";
import { formatDistance } from "date-fns";
import Link from "next/link";
import { memo, useMemo } from "react";

import { Button } from "@/app/components/Button";
import { Card } from "@/app/components/Card";
import { Loader } from "@/app/components/Loader";
import { trpc } from "@/app/lib/api/trpc";
import { Campaign } from "@/db/models/Campaign";
import { CampaignFilter } from "@/server/enums/CampaignFilter";

const CampaignCard = ({ campaign }: { campaign: Campaign }) => {
    const nextScheduleTime = useMemo(() => {
        if (!campaign.schedules.some((schedule) => !!schedule.nextSessionAt)) {
            return null;
        }

        const nextScheduleTime = Math.min(
            ...campaign.schedules
                .filter(
                    (schedule) =>
                        !!schedule.nextSessionAt &&
                        schedule.nextSessionAt > new Date(),
                )
                .map((schedule) => schedule.nextSessionAt.getTime()),
        );

        return new Date(nextScheduleTime);
    }, [campaign.schedules]);

    return (
        <Card asChild color="default">
            <Link
                href={`/campaign/${campaign.id}`}
                className="flex w-full flex-col gap-1.5 rounded-lg border border-white/10 p-3"
            >
                <Card.Title>{campaign.name}</Card.Title>
                {campaign.createdBy && (
                    <Card.Subtitle>by {campaign.createdBy?.name}</Card.Subtitle>
                )}

                <Card.Details>
                    <Card.Details.Item icon="mdi:clock">
                        {campaign.totalSessions} sessions
                    </Card.Details.Item>
                    {nextScheduleTime && (
                        <Card.Details.Item icon="mdi:alarm">
                            {formatDistance(nextScheduleTime, new Date(), {
                                addSuffix: true,
                            })}
                        </Card.Details.Item>
                    )}
                </Card.Details>
            </Link>
        </Card>
    );
};

export const CampaignsList = memo(() => {
    const campaigns = trpc.campaign.list.useQuery({
        filter: CampaignFilter.MY_CAMPAIGNS,
    });

    return (
        <div className="flex w-full flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
            <div className="flex w-full">
                <p className="flex-auto text-xl font-semibold">My Campaigns</p>

                <Button
                    size="md"
                    color="primary"
                    icon="mdi:plus"
                    link="/campaign/create"
                    className="!py-1"
                >
                    Create Campaign
                </Button>
            </div>

            <div
                className={clsx("flex w-full justify-center", {
                    "py-10": campaigns.isPending || !campaigns.data,
                })}
            >
                {campaigns.isPending || !campaigns.data ? (
                    <Loader className="h-8 w-8 text-white/40" />
                ) : campaigns.data.length === 0 ? (
                    <p className="text-sm text-white/80">
                        You are part of no campaigns - create one!
                    </p>
                ) : (
                    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                        {campaigns.data.map((campaign) => (
                            <CampaignCard
                                campaign={campaign}
                                key={campaign.id}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
});
