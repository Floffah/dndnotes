import { CampaignSessionType } from "@/db/enums/CampaignSessionType";
import { RepeatInterval } from "@/db/enums/RepeatInterval";
import { Campaign } from "@/db/models/Campaign";
import { CampaignSession } from "@/db/models/CampaignSession";
import { IBaseModel } from "@/db/types/baseModel";

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
