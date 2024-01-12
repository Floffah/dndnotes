import { CampaignSessionStartType } from "@/db/enums/CampaignSessionStartType";
import { CampaignSessionType } from "@/db/enums/CampaignSessionType";
import { Campaign } from "@/db/models/Campaign";
import { CampaignMember } from "@/db/models/CampaignMember";
import { IBaseModel } from "@/db/models/baseModel";

export interface CampaignSession extends IBaseModel {
    name: string;
    type: CampaignSessionType;
    campaign: Campaign;
    startedBy: CampaignMember;
    startedAt: Date;
    startType: CampaignSessionStartType;
}
