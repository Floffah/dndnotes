import { registerClass } from "superjson";

import { CampaignAPIModel } from "@/db/models/Campaign/consumers";
import { CampaignInviteAPIModel } from "@/db/models/CampaignInvite/consumers";
import { CampaignMemberAPIModel } from "@/db/models/CampaignMember/consumers";
import { CampaignSessionAPIModel } from "@/db/models/CampaignSession/consumers";
import { CampaignSessionScheduleAPIModel } from "@/db/models/CampaignSessionSchedule/consumers";
import { FriendshipRequestAPIModel } from "@/db/models/FriendshipRequest/consumers";
import { UserAPIModel } from "@/db/models/User/consumers";

export function registerTransformerTypes() {
    registerClass(CampaignAPIModel);
    registerClass(CampaignInviteAPIModel);
    registerClass(CampaignMemberAPIModel);
    registerClass(CampaignSessionAPIModel);
    registerClass(CampaignSessionScheduleAPIModel);
    registerClass(FriendshipRequestAPIModel);
    registerClass(UserAPIModel);
}
