import { CampaignSessionType } from "@/enums/CampaignSessionType";
import { RepeatInterval } from "@/enums/RepeatInterval";
import { isPopulated } from "@/lib/isPopulated";
import { Campaign } from "@/models/Campaign";
import { CampaignAPIModel } from "@/consumers/CampaignAPIModel";
import { CampaignSession } from "@/models/CampaignSession";
import { CampaignSessionAPIModel } from "@/consumers/CampaignSessionAPIModel";
import { CampaignSessionSchedule } from "@/models/CampaignSessionSchedule";
import { BaseAPIModel } from "@/types/baseModel";
import { ConsumerContext } from "@/types/consumerContext";

export class CampaignSessionScheduleAPIModel
    extends BaseAPIModel
    implements CampaignSessionSchedule
{
    name: string;
    type: CampaignSessionType;
    campaign: Campaign;
    sessions: CampaignSession[]; // virtual

    firstSessionAt: Date;
    repeat?: RepeatInterval;
    length: number; // millis
    nextSessionAt: Date; // virtual

    constructor(
        campaignSessionSchedule: CampaignSessionSchedule,
        ctx: ConsumerContext,
    ) {
        super(campaignSessionSchedule, ctx);

        this.name = campaignSessionSchedule.name;
        this.type = campaignSessionSchedule.type;
        this.campaign = isPopulated(campaignSessionSchedule.campaign)
            ? new CampaignAPIModel(campaignSessionSchedule.campaign, ctx)
            : null!;
        this.sessions = campaignSessionSchedule.sessions?.some(isPopulated)
            ? campaignSessionSchedule.sessions.map(
                  (session) => new CampaignSessionAPIModel(session, ctx),
              )
            : [];
        this.firstSessionAt = campaignSessionSchedule.firstSessionAt;
        this.repeat = campaignSessionSchedule.repeat;
        this.length = campaignSessionSchedule.length;
        this.nextSessionAt = campaignSessionSchedule.nextSessionAt;
    }
}
