"use client";

import { Button, Loader } from "@dndnotes/components";
import { CampaignError } from "@dndnotes/models";
import { CampaignFilter, DiscordActivityFeatureFlags } from "@dndnotes/server";

import { LinkCampaignDialog } from "@/app/LinkCampaignDialog";
import { api } from "@/lib/api";
import { useDiscord } from "@/providers/DiscordProvider";
import { useFeatures } from "@/providers/FeaturesProvider";

export default function Dashboard() {
    const discord = useDiscord();
    const features = useFeatures();

    const guildCampaigns = api.campaign.list.useQuery(
        {
            filter: CampaignFilter.GUILD_LINKED,
        },
        {
            enabled: !!discord.sdk.guildId,
            retry: false,
        },
    );

    return (
        <div className="bg-pattern-topography relative flex h-screen w-screen flex-col items-center justify-center gap-2 p-3">
            {guildCampaigns.isLoading && (
                <>
                    <p>Fetching campaigns...</p>
                    <Loader />
                </>
            )}

            {(guildCampaigns.error &&
                guildCampaigns.error.message ===
                    CampaignError.GUILD_NOT_FOUND) ||
                (guildCampaigns.data?.length == 0 && (
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
                ))}

            {!guildCampaigns.isLoading &&
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
        </div>
    );
}
