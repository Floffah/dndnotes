import { CampaignSessionType } from "@/db/enums/CampaignSessionType";
import { isPopulated } from "@/db/lib/isPopulated";
import { Campaign } from "@/db/models/Campaign";
import { CampaignAPIModel } from "@/db/models/Campaign/consumers";
import { CampaignSession } from "@/db/models/CampaignSession/index";
import { CampaignSessionSchedule } from "@/db/models/CampaignSessionSchedule";
import { CampaignSessionScheduleAPIModel } from "@/db/models/CampaignSessionSchedule/consumers";
import { Document } from "@/db/models/Document";
import { DocumentAPIModel } from "@/db/models/Document/consumers";
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
    summary: Document;
    schedule?: CampaignSessionSchedule;

    constructor(campaignSession: CampaignSession, ctx: ConsumerContext) {
        super(campaignSession, ctx);

        this.name = campaignSession.name;
        this.type = campaignSession.type;
        this.campaign = isPopulated(campaignSession.campaign)
            ? new CampaignAPIModel(campaignSession.campaign, ctx)
            : null!;
        this.startedAt = campaignSession.startedAt;
        this.summary = isPopulated(campaignSession.summary)
            ? new DocumentAPIModel(campaignSession.summary, ctx)
            : null!;
        this.schedule = isPopulated(campaignSession.schedule)
            ? new CampaignSessionScheduleAPIModel(
                  campaignSession.schedule!,
                  ctx,
              )
            : null!;
    }
}
