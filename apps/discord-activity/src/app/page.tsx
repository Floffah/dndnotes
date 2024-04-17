"use client";

import Link from "next/link";

import { Button, Loader } from "@dndnotes/components";
import { DiscordActivityFeatureFlags } from "@dndnotes/server";

import { LinkCampaignDialog } from "@/app/LinkCampaignDialog";
import { useDiscord } from "@/providers/DiscordProvider";
import { useFeatures } from "@/providers/FeaturesProvider";
import { useGuildCampaigns } from "@/providers/GuildCampaignsProvider";

export default function Dashboard() {
    const discord = useDiscord();
    const features = useFeatures();
    const campaigns = useGuildCampaigns();

    return (
        <div className="bg-pattern-topography relative flex h-screen w-screen flex-col items-center justify-center gap-2 p-3">
            {campaigns.loading && (
                <>
                    <p>Fetching campaigns...</p>
                    <Loader />
                </>
            )}

            {!campaigns.loading && campaigns.campaigns.length === 0 && (
                <div className="m-4 flex w-fit max-w-sm flex-col gap-2 rounded-lg border border-white/15 bg-gray-800 p-3">
                    <p className="text-lg font-semibold">
                        This server is not linked to any campaigns.
                    </p>
                    <LinkCampaignDialog>
                        <Button size="md" color="primary">
                            Link one!
                        </Button>
                    </LinkCampaignDialog>
                </div>
            )}

            {!campaigns.loading &&
                features.discord.includes(
                    DiscordActivityFeatureFlags.SHOW_INVITE_BOT_BUTTON,
                ) && (
                    <div className="fixed right-0 top-0 m-3 flex max-w-xs items-center gap-2 rounded-lg border border-white/10 bg-gray-800 p-2 shadow-xl">
                        <p className="text-sm">
                            DNDNotes does more with the Discord bot! Sync your
                            schedules, documents, characters, and more!
                        </p>
                        <Button
                            className="flex-shrink-0"
                            size="sm"
                            color="primary"
                            onClick={() => discord.inviteBot()}
                        >
                            Invite now
                        </Button>
                    </div>
                )}

            {campaigns.campaigns.length > 0 && (
                <div className="flex w-full max-w-lg flex-col gap-4 rounded-lg border border-white/10 bg-gray-800 p-3">
                    <h1 className="text-2xl font-bold">Pick a Campaign</h1>
                    <div className="flex flex-col gap-2">
                        {campaigns.campaigns.map((campaign) => (
                            <div
                                key={campaign.id}
                                className="flex w-full items-center gap-2 rounded-lg bg-gray-900/50 p-2"
                            >
                                <p className="flex-1">{campaign.name}</p>
                                <Button size="sm" color="primary" asChild>
                                    <Link href={`/${campaign.id}`} prefetch>
                                        Open
                                    </Link>
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
