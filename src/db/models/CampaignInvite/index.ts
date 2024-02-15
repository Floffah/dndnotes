import { Campaign } from "@/db/models/Campaign";
import { User } from "@/db/models/User";
import { IBaseModel } from "@/db/types/baseModel";

export interface CampaignInvite extends IBaseModel {
    campaign: Campaign;
    viewedBy: User[];
    acceptedBy: User[];
    createdBy: User;
    code: string;
}
