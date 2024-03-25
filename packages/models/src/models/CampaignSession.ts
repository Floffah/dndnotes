import { CampaignSessionType } from "@/enums/CampaignSessionType";
import { Campaign } from "@/models/Campaign";
import { CampaignSessionSchedule } from "@/models/CampaignSessionSchedule";
import { Document } from "@/models/Document";
import { IBaseModel } from "@/types/baseModel";

export interface CampaignSession extends IBaseModel {
    name: string;
    type: CampaignSessionType;
    campaign: Campaign;
    summary: Document;
    startedAt: Date;
    schedule?: CampaignSessionSchedule; // virtual
}
