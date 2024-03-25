import { Campaign } from "@/models/Campaign";
import { User } from "@/models/User";
import { IBaseModel } from "@/types/baseModel";

export interface CampaignInvite extends IBaseModel {
    campaign: Campaign;
    viewedBy: User[];
    acceptedBy: User[];
    createdBy: User;
    code: string;
}
