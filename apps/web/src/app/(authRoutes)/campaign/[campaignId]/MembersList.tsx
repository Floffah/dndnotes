import { CampaignMember, CampaignMemberType } from "@dndnotes/models";
import clsx from "clsx";

import { CampaignInviteDialog } from "@/app/(authRoutes)/campaign/[campaignId]/CampaignInviteDialog";
import { Icon } from "@/app/components/Icon";
import { Loader } from "@/app/components/Loader";
import { useCampaign } from "@/app/providers/CampaignProvider";

function Member({ member }: { member: CampaignMember }) {
    return (
        <div
            key={member.id}
            className="flex cursor-pointer select-none items-center gap-2 rounded px-4 py-1 hover:bg-white/5"
        >
            <p className="text-lg font-semibold">{member.user.name}</p>
            {member.type === CampaignMemberType.DM && (
                <Icon
                    label="dungeon master"
                    icon="mdi:crown"
                    className="h-4 w-4 text-yellow-400"
                />
            )}
        </div>
    );
}

export function MembersList() {
    const campaign = useCampaign();

    return (
        <aside
            className={clsx(
                "flex w-full max-w-[17rem] flex-col overflow-y-auto overflow-x-hidden rounded-lg border border-white/10 bg-white/5",
                {
                    "items-center justify-center": campaign.loading,
                },
            )}
        >
            {campaign.currentMember.type === CampaignMemberType.DM && (
                <CampaignInviteDialog>
                    <div className="mt-2.5 flex cursor-pointer select-none items-center gap-2 rounded px-4 py-1 hover:bg-white/5">
                        <Icon
                            label="invite"
                            icon="mdi:account-plus"
                            className="h-4 w-4"
                        />

                        <p className="text-lg font-semibold">Invite</p>
                    </div>
                </CampaignInviteDialog>
            )}

            {!campaign.loading ? (
                <>
                    <p className="my-1.5 p-3 pb-0 text-xs text-white/75">
                        MEMBERS &#8212; {campaign.members.length}
                    </p>

                    {campaign.members.map((member) => (
                        <Member key={member.id} member={member} />
                    ))}
                </>
            ) : (
                <Loader className="h-8 w-8 text-white/50" />
            )}
        </aside>
    );
}
