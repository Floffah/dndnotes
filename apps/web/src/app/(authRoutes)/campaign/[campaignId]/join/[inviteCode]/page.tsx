"use client";

import { useRouter } from "next/navigation";

import { Button } from "@dndnotes/components";

import { useCampaignInvite } from "@/app/providers/CampaignInviteProvider";

export default function CampaignInvitePage() {
    const router = useRouter();
    const invite = useCampaignInvite();

    return (
        <div className="flex h-screen w-screen flex-col items-center justify-center">
            <main className="flex max-w-md flex-col gap-4 rounded-lg bg-gray-800 p-5">
                <h1 className="text-2xl font-semibold text-white">
                    Join {invite.campaign.name}
                </h1>

                <Button
                    size="md"
                    color="primary"
                    onClick={async () => {
                        await invite.accept();
                        router.push(`/campaign/${invite.campaign.id}`);
                    }}
                    className="w-full"
                >
                    Accept Invite
                </Button>
            </main>
        </div>
    );
}
