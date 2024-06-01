import { registerClass } from "superjson";

import { CampaignAPIModel } from "@/consumers/CampaignAPIModel";
import { CampaignInviteAPIModel } from "@/consumers/CampaignInviteAPIModel";
import { CampaignMemberAPIModel } from "@/consumers/CampaignMemberAPIModel";
import { CampaignSessionAPIModel } from "@/consumers/CampaignSessionAPIModel";
import { CampaignSessionScheduleAPIModel } from "@/consumers/CampaignSessionScheduleAPIModel";
import { CharacterAPIModel } from "@/consumers/CharacterAPIModel";
import { DocumentAPIModel } from "@/consumers/DocumentAPIModel";
import { FriendshipRequestAPIModel } from "@/consumers/FriendshipRequestAPIModel";
import { UserAPIModel } from "@/consumers/UserAPIModel";

export function registerTransformerTypes() {
    registerClass(CampaignAPIModel, { identifier: "Campaign" });
    registerClass(CampaignInviteAPIModel, { identifier: "CampaignInvite" });
    registerClass(CampaignMemberAPIModel, { identifier: "CampaignMember" });
    registerClass(CampaignSessionAPIModel, { identifier: "CampaignSession" });
    registerClass(CampaignSessionScheduleAPIModel, {
        identifier: "CampaignSessionSchedule",
    });
    registerClass(CharacterAPIModel, { identifier: "Character" });
    registerClass(DocumentAPIModel, {
        identifier: "Document",
    });
    registerClass(FriendshipRequestAPIModel, {
        identifier: "FriendshipRequest",
    });
    registerClass(UserAPIModel, { identifier: "User" });

    // external
    // registerClass(ServerError, { identifier: "ServerError" });
}
