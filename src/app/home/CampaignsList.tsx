"use client";

import clsx from "clsx";
import Link from "next/link";

import { trpc } from "@/app/api/lib/client/trpc";
import { Button } from "@/app/components/Button";
import { Loader } from "@/app/components/Loader";
import { CampaignFilter } from "@/server/enums/CampaignFilter";

export function CampaignsList() {
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
                    "py-10": campaigns.isLoading || !campaigns.data,
                })}
            >
                {campaigns.isLoading || !campaigns.data ? (
                    <Loader className="h-8 w-8 text-white/40" />
                ) : campaigns.data.length === 0 ? (
                    <p className="text-sm text-white/80">
                        You are part of no campaigns - create one!
                    </p>
                ) : (
                    <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                        {campaigns.data.map((campaign) => (
                            <Link
                                href={`/campaign/${campaign.id}`}
                                key={campaign.id}
                                className="flex w-full flex-col gap-1.5 rounded-lg border border-white/10 p-3"
                            >
                                <p className="text-lg font-semibold">
                                    {campaign.name}
                                </p>
                                {campaign.createdBy && (
                                    <p className="-mt-2.5 text-sm text-white/75">
                                        by {campaign.createdBy?.name}
                                    </p>
                                )}

                                <p className="text-sm text-white/80">
                                    More info will display here soon
                                </p>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
