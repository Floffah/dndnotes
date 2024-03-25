import { CampaignSessionType } from "@/enums/CampaignSessionType";
import { isPopulated } from "@/lib/isPopulated";
import { Campaign } from "@/models/Campaign";
import { CampaignAPIModel } from "@/consumers/CampaignAPIModel";
import { CampaignSession } from "@/models/CampaignSession";
import { CampaignSessionSchedule } from "@/models/CampaignSessionSchedule";
import { CampaignSessionScheduleAPIModel } from "@/consumers/CampaignSessionScheduleAPIModel";
import { Document } from "@/models/Document";
import { DocumentAPIModel } from "@/consumers/DocumentAPIModel";
import { BaseAPIModel } from "@/types/baseModel";
import { ConsumerContext } from "@/types/consumerContext";

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
