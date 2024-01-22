import { isPopulated } from "@/db/lib/isPopulated";
import { Campaign } from "@/db/models/Campaign/index";
import { User } from "@/db/models/User";
import { UserAPIModel } from "@/db/models/User/consumers";
import { BaseAPIModel } from "@/db/types/baseModel";
import { ConsumerContext } from "@/db/types/consumerContext";

export class CampaignAPIModel extends BaseAPIModel implements Campaign {
    name: string;
    createdBy: User;
    totalSessions: number;

    constructor(campaign: Campaign, ctx: ConsumerContext) {
        super(campaign, ctx);
        this.name = campaign.name;
        this.createdBy = isPopulated(campaign.createdBy)
            ? new UserAPIModel(campaign.createdBy, ctx)
            : null!;
        this.totalSessions = campaign.totalSessions;
    }
}
