import { CampaignMemberType } from "@/enums/CampaignMemberType";
import { isPopulated } from "@/lib/isPopulated";
import { Campaign } from "@/models/Campaign";
import { CampaignAPIModel } from "@/consumers/CampaignAPIModel";
import { CampaignMember } from "@/models/CampaignMember";
import { Character } from "@/models/Character";
import { User } from "@/models/User";
import { UserAPIModel } from "@/consumers/UserAPIModel";
import { BaseAPIModel } from "@/types/baseModel";
import { ConsumerContext } from "@/types/consumerContext";

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
