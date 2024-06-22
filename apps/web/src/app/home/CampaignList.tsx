"use client";

import { api } from "@/lib/api";

export function CampaignList() {
    const campaigns = api.campaign.list.useQuery();

    return (
        <section className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold">My Campaigns</h1>

            {campaigns.data?.length !== 0 && (
                <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                    {campaigns.isLoading && (
                        <>
                            <div className="h-32 animate-pulse rounded-lg bg-white/10" />
                            <div className="h-32 animate-pulse rounded-lg bg-white/10" />
                            <div className="h-32 animate-pulse rounded-lg bg-white/10" />
                        </>
                    )}
                </div>
            )}

            {campaigns.data?.length === 0 && (
                <p className="mx-auto my-8 text-sm text-white/80">
                    You are part of no campaigns - create one!
                </p>
            )}
        </section>
    );
}
