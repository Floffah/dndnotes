import { isPopulated } from "@/db/lib/isPopulated";
import { Campaign } from "@/db/models/Campaign";
import { CampaignAPIModel } from "@/db/models/Campaign/consumers";
import { CampaignInvite } from "@/db/models/CampaignInvite/index";
import { User } from "@/db/models/User";
import { UserAPIModel } from "@/db/models/User/consumers";
import { BaseAPIModel } from "@/db/types/baseModel";
import { ConsumerContext } from "@/db/types/consumerContext";

export class CampaignInviteAPIModel
    extends BaseAPIModel
    implements CampaignInvite
{
    campaign: Campaign;
    user: User;
    code: string;

    constructor(campaignInvite: CampaignInvite, ctx: ConsumerContext) {
        super(campaignInvite, ctx);
        this.campaign = isPopulated(campaignInvite.campaign)
            ? new CampaignAPIModel(campaignInvite.campaign, ctx)
            : null!;
        this.user = isPopulated(campaignInvite.user)
            ? new UserAPIModel(campaignInvite.user, ctx)
            : null!;
        this.code = campaignInvite.code;
    }
}
