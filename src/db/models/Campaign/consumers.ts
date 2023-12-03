import { Campaign } from "@/db/models/Campaign/index";
import { CampaignMember } from "@/db/models/CampaignMember";
import { User } from "@/db/models/User";
import {
    UserAPIModel,
    UserAPIType,
    UserClientModel,
} from "@/db/models/User/consumers";
import { BaseAPIModel, BaseClientModel } from "@/db/models/baseModel";
import { ModelLike, OmitAPI, ToObjectType } from "@/db/models/types";

export class CampaignAPIModel
    extends BaseAPIModel
    implements Omit<Campaign, "createdBy">
{
    name: string;
    createdBy: User | null;

    constructor(campaign: Campaign) {
        super(campaign);
        this.name = campaign.name;
        this.createdBy =
            campaign.createdBy && campaign.createdBy.name
                ? campaign.createdBy
                : null;
    }

    toObject(
        opts: { currentUser?: User; currentMember?: CampaignMember } = {},
    ) {
        const base = super.toObject();

        return {
            ...base,
            name: this.name,
            createdBy: this.createdBy
                ? new UserAPIModel(this.createdBy).toObject(opts)
                : null,
        };
    }
}

export type CampaignAPIType = ToObjectType<CampaignAPIModel>;

export class CampaignClientModel
    extends BaseClientModel
    implements OmitAPI<CampaignAPIModel, "createdBy">
{
    name: string;
    createdBy: UserAPIType | null;

    constructor(campaign: CampaignAPIType) {
        super(campaign);
        this.name = campaign.name;
        this.createdBy = campaign.createdBy ? campaign.createdBy : null;
    }

    toObject(
        opts: {
            currentUser?: ModelLike<User>;
            currentMember?: Omit<
                ModelLike<CampaignMember>,
                "user" | "campaign"
            >;
        } = {},
    ) {
        return {
            ...super.toObject(),
            name: this.name,
            createdBy: this.createdBy
                ? new UserClientModel(this.createdBy).toObject(opts)
                : null,
        };
    }
}

export type CampaignClientType = ToObjectType<CampaignClientModel>;
