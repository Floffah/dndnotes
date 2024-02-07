import { registerClass } from "superjson";

import { CampaignAPIModel } from "@/db/models/Campaign/consumers";
import { CampaignInviteAPIModel } from "@/db/models/CampaignInvite/consumers";
import { CampaignMemberAPIModel } from "@/db/models/CampaignMember/consumers";
import { CampaignSessionAPIModel } from "@/db/models/CampaignSession/consumers";
import { CampaignSessionScheduleAPIModel } from "@/db/models/CampaignSessionSchedule/consumers";
import { DocumentAPIModel } from "@/db/models/Document/consumers";
import { FriendshipRequestAPIModel } from "@/db/models/FriendshipRequest/consumers";
import { UserAPIModel } from "@/db/models/User/consumers";

export function registerTransformerTypes() {
    registerClass(CampaignAPIModel, { identifier: "Campaign" });
    registerClass(CampaignInviteAPIModel, { identifier: "CampaignInvite" });
    registerClass(CampaignMemberAPIModel, { identifier: "CampaignMember" });
    registerClass(CampaignSessionAPIModel, { identifier: "CampaignSession" });
    registerClass(CampaignSessionScheduleAPIModel, {
        identifier: "CampaignSessionSchedule",
    });
    registerClass(DocumentAPIModel, {
        identifier: "Document",
    });
    registerClass(FriendshipRequestAPIModel, {
        identifier: "FriendshipRequest",
    });
    registerClass(UserAPIModel, { identifier: "User" });
}
