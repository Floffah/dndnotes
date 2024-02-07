import { CampaignSessionType } from "@/db/enums/CampaignSessionType";
import { Campaign } from "@/db/models/Campaign";
import { CampaignSessionSchedule } from "@/db/models/CampaignSessionSchedule";
import { Document } from "@/db/models/Document";
import { IBaseModel } from "@/db/types/baseModel";

export interface CampaignSession extends IBaseModel {
    name: string;
    type: CampaignSessionType;
    campaign: Campaign;
    summary: Document;
    startedAt: Date;
    schedule?: CampaignSessionSchedule; // virtual
}
