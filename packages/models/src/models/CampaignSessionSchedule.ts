import { CampaignSessionType } from "@/enums/CampaignSessionType";
import { RepeatInterval } from "@/enums/RepeatInterval";
import { Campaign } from "@/models/Campaign";
import { CampaignSession } from "@/models/CampaignSession";
import { IBaseModel } from "@/types/baseModel";

export interface CampaignSessionSchedule extends IBaseModel {
    name: string;
    type: CampaignSessionType;
    campaign: Campaign;
    sessions: CampaignSession[]; // virtual

    firstSessionAt: Date;
    repeat?: RepeatInterval;
    length: number; // millis
    nextSessionAt: Date; // virtual
}
