import { CampaignMember } from "@/models/CampaignMember";
import { User } from "@/models/User";

export interface ConsumerContext {
    user?: User;
    campaignMember?: CampaignMember;
}
