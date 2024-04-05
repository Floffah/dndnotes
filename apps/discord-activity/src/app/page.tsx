"use client";

import { Loader } from "@dndnotes/components";
import { CampaignError } from "@dndnotes/models";
import { CampaignFilter } from "@dndnotes/server";

import { api } from "@/lib/api";
import { useDiscord } from "@/providers/DiscordProvider";

export default function Dashboard() {
    const discord = useDiscord();

    const me = api.user.me.useQuery();

    const guildCampaigns = api.campaign.list.useQuery(
        {
            filter: CampaignFilter.GUILD_CAMPAIGNS,
            guildId: discord.sdk.guildId!,
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

            {guildCampaigns.error &&
                guildCampaigns.error.message ===
                    CampaignError.GUILD_NOT_FOUND && (
                    <p>
                        This server is not linked to any campaigns. Ask your DM
                        to link one on DNDNotes
                    </p>
                )}
        </div>
    );
}
