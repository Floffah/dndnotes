"use client";

import Link from "next/link";

import { Divider } from "@/app/components/Divider";
import { Icon } from "@/app/components/Icon";
import { useCampaign } from "@/app/providers/CampaignProvider";
import { CampaignSession } from "@/db/models/CampaignSession";

export function CampaignNavBar({ session }: { session?: CampaignSession }) {
    const campaign = useCampaign();

    return (
        <nav className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-2">
            <Link
                href="/"
                className="flex cursor-pointer select-none items-center justify-center p-1 transition-all duration-150 hover:scale-110"
            >
                <Icon label="go home" icon="mdi:home" className="h-5 w-5" />
            </Link>

            <Divider orientation="vertical" />

            {session ? (
                <>
                    <Link
                        href={`/campaign/${campaign.id}`}
                        className="text-lg font-semibold transition-transform duration-150 hover:scale-105"
                    >
                        {campaign.name}
                    </Link>
                    <Divider orientation="vertical" />
                    <p className="text-lg">{session.name}</p>
                </>
            ) : (
                <>
                    <Link
                        href={`/campaign/${campaign.id}`}
                        className="text-lg font-semibold transition-transform duration-150 hover:scale-105"
                    >
                        {campaign.name}
                    </Link>
                    <p className="text-sm text-white/80">
                        by {campaign.createdBy?.name}
                    </p>
                </>
            )}

            <Divider orientation="vertical" />

            <Link
                href={`/campaign/${campaign.id}/settings`}
                className="flex cursor-pointer select-none items-center justify-center p-1 transition-all duration-150 hover:scale-110"
            >
                <Icon
                    label="campaign settings icon"
                    icon="mdi:cog"
                    className="h-5 w-5"
                />
            </Link>
        </nav>
    );
}
