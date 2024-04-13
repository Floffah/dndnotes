import { CampaignSession } from "@/models/CampaignSession";
import { CampaignSessionSchedule } from "@/models/CampaignSessionSchedule";
import { DiscordGuild } from "@/models/DiscordGuild";
import { User } from "@/models/User";
import { IBaseModel } from "@/types/baseModel";

export interface Campaign extends IBaseModel {
    name: string;
    createdBy: User;
    totalSessions: number;

    sessions: CampaignSession[];
    schedules: CampaignSessionSchedule[];
    discordGuild?: DiscordGuild; // null in api
    isLinkedToGuild: boolean; // public in api
}
