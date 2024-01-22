import { CampaignMemberType } from "@/db/enums/CampaignMemberType";
import { isPopulated } from "@/db/lib/isPopulated";
import { Campaign } from "@/db/models/Campaign";
import { CampaignAPIModel } from "@/db/models/Campaign/consumers";
import { CampaignMember } from "@/db/models/CampaignMember/index";
import { Character } from "@/db/models/Character";
import { User } from "@/db/models/User";
import { UserAPIModel } from "@/db/models/User/consumers";
import { BaseAPIModel } from "@/db/types/baseModel";
import { ConsumerContext } from "@/db/types/consumerContext";

export class CampaignMemberAPIModel
    extends BaseAPIModel
    implements CampaignMember
{
    type: CampaignMemberType;
    campaign: Campaign;
    user: User;
    character?: Character;

    constructor(campaignMember: CampaignMember, ctx: ConsumerContext) {
        super(campaignMember, ctx);
        this.type = campaignMember.type;
        this.campaign = isPopulated(campaignMember.campaign)
            ? new CampaignAPIModel(campaignMember.campaign, ctx)
            : null!;
        this.user = isPopulated(campaignMember.user)
            ? new UserAPIModel(campaignMember.user, ctx)
            : null!;
        this.character = null!;
    }
}
