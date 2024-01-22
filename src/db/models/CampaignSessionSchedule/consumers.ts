import { CampaignSessionType } from "@/db/enums/CampaignSessionType";
import { RepeatInterval } from "@/db/enums/RepeatInterval";
import { isPopulated } from "@/db/lib/isPopulated";
import { Campaign } from "@/db/models/Campaign";
import { CampaignAPIModel } from "@/db/models/Campaign/consumers";
import { CampaignSession } from "@/db/models/CampaignSession";
import { CampaignSessionAPIModel } from "@/db/models/CampaignSession/consumers";
import { CampaignSessionSchedule } from "@/db/models/CampaignSessionSchedule/index";
import { BaseAPIModel } from "@/db/types/baseModel";
import { ConsumerContext } from "@/db/types/consumerContext";

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
