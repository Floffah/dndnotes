import { CampaignMember } from "@/db/models/CampaignMember";
import { IBaseModel } from "@/db/models/baseModel";

export interface Campaign extends IBaseModel {
    name: string;
    members: CampaignMember[];
}
