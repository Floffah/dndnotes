import { CampaignMemberType } from "@/db/enums/CampaignMemberType";
import { Campaign } from "@/db/models/Campaign";
import { Character } from "@/db/models/Character";
import { User } from "@/db/models/User";
import { IBaseModel } from "@/db/types/baseModel";

export interface CampaignMember extends IBaseModel {
    type: CampaignMemberType;
    campaign: Campaign;
    user: User;
    character?: Character;
}
