import { ObjectId } from "mongodb";

import { Campaign } from "@/db/models/Campaign/index";
import { CampaignMember } from "@/db/models/CampaignMember";
import { User } from "@/db/models/User";
import {
    UserAPIModel,
    UserAPIType,
    UserClientModel,
    UserClientType,
} from "@/db/models/User/consumers";
import { BaseAPIModel, BaseClientModel } from "@/db/models/baseModel";
import { OmitAPI, RemoveAPIFields, ToObjectType } from "@/db/models/types";

export class CampaignAPIModel
    extends BaseAPIModel
    implements Omit<Campaign, "createdBy">
{
    name: string;
    createdBy: UserAPIType | null;

    constructor(campaign: Campaign) {
        super(campaign);
        this.name = campaign.name;
        this.createdBy =
            campaign.createdBy && campaign.createdBy.name
                ? new UserAPIModel(campaign.createdBy).toObject()
                : null;
    }

    toObject(
        opts: { currentUser?: User; currentMember?: CampaignMember } = {},
    ) {
        const base = super.toObject();

        return {
            ...base,
            name: this.name,
            createdBy: this.createdBy,
        };
    }
}

export type CampaignAPIType = ToObjectType<CampaignAPIModel>;

export class CampaignClientModel
    extends BaseClientModel
    implements OmitAPI<CampaignAPIModel, "createdBy">
{
    name: string;
    createdBy: UserClientType | null;

    constructor(campaign: CampaignAPIType) {
        super(campaign);
        this.name = campaign.name;
        this.createdBy = campaign.createdBy
            ? new UserClientModel(campaign.createdBy).toObject()
            : null;
    }

    toObject(
        opts: { currentUser?: User; currentMember?: CampaignMember } = {},
    ) {
        return {
            ...super.toObject(),
            name: this.name,
            createdBy: this.createdBy,
        };
    }
}
