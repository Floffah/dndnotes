import { CampaignSession } from "@/db/models/CampaignSession";
import { CampaignSessionSchedule } from "@/db/models/CampaignSessionSchedule";
import { User } from "@/db/models/User";
import { IBaseModel } from "@/db/types/baseModel";

export interface Campaign extends IBaseModel {
    name: string;
    createdBy: User;
    totalSessions: number;

    sessions: CampaignSession[];
    schedules: CampaignSessionSchedule[];
}
