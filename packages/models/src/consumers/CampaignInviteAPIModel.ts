import { CampaignAPIModel } from "@/consumers/CampaignAPIModel";
import { UserAPIModel } from "@/consumers/UserAPIModel";
import { isPopulated } from "@/lib/isPopulated";
import { Campaign } from "@/models/Campaign";
import { CampaignInvite } from "@/models/CampaignInvite";
import { User } from "@/models/User";
import { BaseAPIModel } from "@/types/baseModel";
import { ConsumerContext } from "@/types/consumerContext";

export class CampaignInviteAPIModel
    extends BaseAPIModel
    implements CampaignInvite
{
    campaign: Campaign;
    viewedBy: User[];
    acceptedBy: User[];
    createdBy: User;
    code: string;

    constructor(campaignInvite: CampaignInvite, ctx: ConsumerContext) {
        super(campaignInvite, ctx);
        this.campaign = isPopulated(campaignInvite.campaign)
            ? new CampaignAPIModel(campaignInvite.campaign, ctx)
            : null!;
        this.viewedBy = campaignInvite.viewedBy
            .filter(isPopulated)
            .map((user) => new UserAPIModel(user, ctx));
        this.acceptedBy = campaignInvite.acceptedBy
            .filter(isPopulated)
            .map((user) => new UserAPIModel(user, ctx));
        this.createdBy = isPopulated(campaignInvite.createdBy)
            ? new UserAPIModel(campaignInvite.createdBy, ctx)
            : null!;
        this.code = campaignInvite.code;
    }
}
