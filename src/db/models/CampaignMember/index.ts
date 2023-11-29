import { Campaign } from "@/db/models/Campaign";
import { User } from "@/db/models/User";
import { IBaseModel } from "@/db/models/baseModel";
import { CampaignMemberType } from "@/db/types/CampaignMemberType";

export interface CampaignMember extends IBaseModel {
    type: CampaignMemberType;
    campaign: Campaign;
    user: User;
}
