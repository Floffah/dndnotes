import { isPopulated } from "@/db/lib/isPopulated";
import { Campaign } from "@/db/models/Campaign/index";
import { CampaignSession } from "@/db/models/CampaignSession";
import { CampaignSessionAPIModel } from "@/db/models/CampaignSession/consumers";
import { CampaignSessionSchedule } from "@/db/models/CampaignSessionSchedule";
import { CampaignSessionScheduleAPIModel } from "@/db/models/CampaignSessionSchedule/consumers";
import { User } from "@/db/models/User";
import { UserAPIModel } from "@/db/models/User/consumers";
import { BaseAPIModel } from "@/db/types/baseModel";
import { ConsumerContext } from "@/db/types/consumerContext";

export class CampaignAPIModel extends BaseAPIModel implements Campaign {
    name: string;
    createdBy: User;
    totalSessions: number;

    sessions: CampaignSession[];
    schedules: CampaignSessionSchedule[];

    constructor(campaign: Campaign, ctx: ConsumerContext) {
        super(campaign, ctx);
        this.name = campaign.name;
        this.createdBy = isPopulated(campaign.createdBy)
            ? new UserAPIModel(campaign.createdBy, ctx)
            : null!;
        this.totalSessions = campaign.totalSessions;

        this.sessions = campaign.sessions?.some(isPopulated)
            ? campaign.sessions.map(
                  (session) => new CampaignSessionAPIModel(session, ctx),
              )
            : null!;
        this.schedules = campaign.schedules?.some(isPopulated)
            ? campaign.schedules.map(
                  (schedule) =>
                      new CampaignSessionScheduleAPIModel(schedule, ctx),
              )
            : null!;
    }
}
