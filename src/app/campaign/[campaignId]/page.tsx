"use client";

import { formatRelative } from "date-fns";
import Link from "next/link";

import { CampaignNavBar } from "@/app/campaign/[campaignId]/CampaignNavBar";
import { MembersList } from "@/app/campaign/[campaignId]/MembersList";
import { NoCampaignPermissionDialog } from "@/app/campaign/[campaignId]/NoCampaignPermissionDialog";
import { SessionList } from "@/app/campaign/[campaignId]/SessionList";
import { Divider } from "@/app/components/Divider";
import { Loader } from "@/app/components/Loader";
import { Tooltip } from "@/app/components/Tooltip";
import { useCampaign } from "@/app/providers/CampaignProvider";
import { useUser } from "@/app/providers/UserProvider";
import { CampaignMemberType } from "@/db/enums/CampaignMemberType";

export default function CampaignPage() {
    const user = useUser();
    const campaign = useCampaign();

    if (
        !user.loading &&
        !user.authenticated &&
        !campaign.loading &&
        !campaign.currentMember
    ) {
        return <NoCampaignPermissionDialog open={true} />;
    }

    return (
        <div className="flex h-full w-full flex-col gap-3 p-3">
            <CampaignNavBar />

            <div className="flex h-full gap-3">
                {campaign.loading ? (
                    <div className="flex h-full w-full flex-auto items-center justify-center">
                        <Loader className="h-8 w-8 text-white/50" />
                    </div>
                ) : (
                    <div className="flex flex-auto flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                            <span className="text-lg font-semibold">
                                Next session at:
                            </span>
                            {!campaign.schedule.nextSession ? (
                                <>
                                    {campaign.currentMember?.type ===
                                    CampaignMemberType.DM ? (
                                        <>
                                            You haven&apos;t set a session time
                                            yet!
                                            <Link
                                                href={`/campaign/${campaign.id}/settings`}
                                                className="text-blue-400 underline decoration-blue-400/75 underline-offset-2"
                                            >
                                                Set one
                                            </Link>
                                        </>
                                    ) : (
                                        "Your DM has not set a session time yet! Tell them to set one!"
                                    )}
                                </>
                            ) : (
                                <>
                                    <Tooltip
                                        title={Intl.DateTimeFormat("en-GB", {
                                            dateStyle: "long",
                                            timeStyle: "short",
                                        }).format(
                                            campaign.schedule.nextSession,
                                        )}
                                        side="bottom"
                                    >
                                        <span className="indicate-action indicate-white/50">
                                            {formatRelative(
                                                campaign.schedule.nextSession,
                                                new Date(),
                                            )}
                                        </span>
                                    </Tooltip>
                                </>
                            )}
                        </div>

                        <SessionList />
                        <Divider />
                    </div>
                )}

                <MembersList campaign={campaign} />
            </div>
        </div>
    );
}
