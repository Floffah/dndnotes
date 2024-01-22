import { CampaignMember } from "@/db/models/CampaignMember";
import { User } from "@/db/models/User";

export interface ConsumerContext {
    user?: User;
    campaignMember?: CampaignMember;
}
