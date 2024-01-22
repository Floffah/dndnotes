import { CampaignSessionType } from "@/db/enums/CampaignSessionType";
import { isPopulated } from "@/db/lib/isPopulated";
import { Campaign } from "@/db/models/Campaign";
import { CampaignAPIModel } from "@/db/models/Campaign/consumers";
import { CampaignSession } from "@/db/models/CampaignSession/index";
import { CampaignSessionSchedule } from "@/db/models/CampaignSessionSchedule";
import { CampaignSessionScheduleAPIModel } from "@/db/models/CampaignSessionSchedule/consumers";
import { BaseAPIModel } from "@/db/types/baseModel";
import { ConsumerContext } from "@/db/types/consumerContext";

export class CampaignSessionAPIModel
    extends BaseAPIModel
    implements CampaignSession
{
    name: string;
    type: CampaignSessionType;
    campaign: Campaign;
    startedAt: Date;
    schedule?: CampaignSessionSchedule;

    constructor(campaignSession: CampaignSession, ctx: ConsumerContext) {
        super(campaignSession, ctx);

        this.name = campaignSession.name;
        this.type = campaignSession.type;
        this.campaign = isPopulated(campaignSession.campaign)
            ? new CampaignAPIModel(campaignSession.campaign, ctx)
            : null!;
        this.startedAt = campaignSession.startedAt;
        this.schedule = isPopulated(campaignSession.schedule)
            ? new CampaignSessionScheduleAPIModel(
                  campaignSession.schedule!,
                  ctx,
              )
            : null!;
    }
}
