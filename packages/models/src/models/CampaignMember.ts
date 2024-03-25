import { CampaignMemberType } from "@/enums/CampaignMemberType";
import { Campaign } from "@/models/Campaign";
import { Character } from "@/models/Character";
import { User } from "@/models/User";
import { IBaseModel } from "@/types/baseModel";

export interface CampaignMember extends IBaseModel {
    type: CampaignMemberType;
    campaign: Campaign;
    user: User;
    character?: Character;
}
