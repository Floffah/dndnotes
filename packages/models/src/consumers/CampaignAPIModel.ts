import { CampaignSessionAPIModel } from "@/consumers/CampaignSessionAPIModel";
import { CampaignSessionScheduleAPIModel } from "@/consumers/CampaignSessionScheduleAPIModel";
import { UserAPIModel } from "@/consumers/UserAPIModel";
import { isPopulated } from "@/lib/isPopulated";
import { Campaign } from "@/models/Campaign";
import { CampaignSession } from "@/models/CampaignSession";
import { CampaignSessionSchedule } from "@/models/CampaignSessionSchedule";
import { User } from "@/models/User";
import { BaseAPIModel } from "@/types/baseModel";
import { ConsumerContext } from "@/types/consumerContext";

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
