import { Campaign } from "@/db/models/Campaign/index";
import { CampaignMember } from "@/db/models/CampaignMember";
import { User } from "@/db/models/User";
import { BaseAPIModel, BaseClientModel } from "@/db/models/baseModel";
import { OmitAPI, RemoveAPIFields, ToObjectType } from "@/db/models/types";

export class CampaignAPIModel extends BaseAPIModel implements Campaign {
    name: string;

    constructor(campaign: Campaign) {
        super(campaign);
        this.name = campaign.name;
    }

    toObject(
        opts: { currentUser?: User; currentMember?: CampaignMember } = {},
    ) {
        const base = super.toObject();

        return {
            ...base,
            name: this.name,
        };
    }
}

export type CampaignAPIType = ToObjectType<CampaignAPIModel>;

export class UserClientModel
    extends BaseClientModel
    implements RemoveAPIFields<CampaignAPIModel>
{
    name: string;

    constructor(campaign: CampaignAPIType) {
        super(campaign);
        this.name = campaign.name;
    }

    toObject(
        opts: { currentUser?: User; currentMember?: CampaignMember } = {},
    ) {
        return {
            ...super.toObject(),
            name: this.name,
        };
    }
}
