import clsx from "clsx";

import { trpc } from "@/app/api/lib/client/trpc";
import { Icon } from "@/app/components/Icon";
import { Loader } from "@/app/components/Loader";
import { CampaignMemberType } from "@/db/enums/CampaignMemberType";
import type { CampaignAPIType } from "@/db/models/Campaign/consumers";
import { CampaignMemberAPIType } from "@/db/models/CampaignMember/consumers";

function Member({ member }: { member: CampaignMemberAPIType }) {
    return (
        <div
            key={member.id}
            className="flex cursor-pointer select-none items-center gap-2 rounded px-4 py-2 hover:bg-white/5"
        >
            <p className="text-lg font-semibold">{member.user.name}</p>
            {member.type === CampaignMemberType.DM && (
                <Icon
                    label="dungeon master icon"
                    icon="mdi:crown"
                    className="h-4 w-4 text-yellow-400"
                />
            )}
        </div>
    );
}

export function MembersList({ campaign }: { campaign: CampaignAPIType }) {
    const campaignMembers = trpc.campaignMember.list.useQuery(
        {
            campaignId: campaign.id,
        },
        {
            enabled: !!campaign?.id,
        },
    );

    return (
        <div
            className={clsx(
                "flex w-full max-w-[17rem] flex-col gap-1 overflow-y-auto overflow-x-hidden rounded-lg border border-white/10 bg-white/5",
                {
                    "items-center justify-center":
                        !campaignMembers.data || !campaign?.id,
                },
            )}
        >
            {campaignMembers.data && campaign?.id ? (
                campaignMembers.data.map((member) => (
                    <Member key={member.id} member={member} />
                ))
            ) : (
                <Loader className="h-8 w-8 text-white/50" />
            )}
        </div>
    );
}
