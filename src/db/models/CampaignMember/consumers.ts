import { CampaignMemberType } from "@/db/enums/CampaignMemberType";
import {
    CampaignAPIModel,
    CampaignAPIType,
    CampaignClientModel,
    CampaignClientType,
} from "@/db/models/Campaign/consumers";
import { CampaignMember } from "@/db/models/CampaignMember/index";
import { User } from "@/db/models/User";
import {
    UserAPIModel,
    UserAPIType,
    UserClientModel,
    UserClientType,
} from "@/db/models/User/consumers";
import { BaseAPIModel, BaseClientModel } from "@/db/models/baseModel";
import { OmitAPI, ToObjectType } from "@/db/models/types";

export class CampaignMemberAPIModel
    extends BaseAPIModel
    implements Omit<CampaignMember, "campaign" | "user" | "character">
{
    type: CampaignMemberType;
    campaign: CampaignAPIType;
    user: UserAPIType;
    character: null;

    constructor(campaignMember: CampaignMember) {
        super(campaignMember);
        this.type = campaignMember.type;
        this.campaign = campaignMember.campaign?.name
            ? new CampaignAPIModel(campaignMember.campaign).toObject()
            : null!;
        this.user = campaignMember.user?.name
            ? new UserAPIModel(campaignMember.user).toObject()
            : null!;
        this.character = null;
    }

    toObject(
        opts: { currentUser?: User; currentMember?: CampaignMember } = {},
    ) {
        const base = super.toObject();

        return {
            ...base,
            type: this.type,
            campaign: this.campaign,
            user: this.user,
            character: this.character,
        };
    }
}
export type CampaignMemberAPIType = ToObjectType<CampaignMemberAPIModel>;

export class CampaignMemberClientModel
    extends BaseClientModel
    implements
        OmitAPI<CampaignMemberAPIModel, "campaign" | "user" | "character">
{
    type: CampaignMemberType;
    campaign: CampaignClientType;
    user: UserClientType;
    character: null;

    constructor(campaignMember: CampaignMemberAPIType) {
        super(campaignMember);
        this.type = campaignMember.type;
        this.campaign = campaignMember.campaign
            ? new CampaignClientModel(campaignMember.campaign).toObject()
            : null!;
        this.user = campaignMember.user
            ? new UserClientModel(campaignMember.user).toObject()
            : null!;
        this.character = null;
    }

    toObject(
        opts: {
            currentUser?: UserAPIType | UserClientType;
            currentMember?: CampaignMemberClientType | CampaignMemberAPIType;
        } = {},
    ) {
        const base = super.toObject();

        return {
            ...base,
            type: this.type,
            campaign: this.campaign,
            user: this.user,
            character: this.character,
        };
    }
}
export type CampaignMemberClientType = ToObjectType<CampaignMemberClientModel>;
