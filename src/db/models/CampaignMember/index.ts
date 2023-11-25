import { IBaseModel } from "@/db/models/baseModel";
import { CampaignMemberType } from "@/db/types/CampaignMemberType";

export interface CampaignMember extends IBaseModel {
    type: CampaignMemberType;
}
