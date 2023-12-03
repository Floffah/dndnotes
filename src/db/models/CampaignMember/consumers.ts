import { CampaignMemberType } from "@/db/enums/CampaignMemberType";
import { Campaign } from "@/db/models/Campaign";
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
import {
    BaseAPIModel,
    BaseAPIType,
    BaseClientModel,
    BaseClientType,
} from "@/db/models/baseModel";
import { ModelLike, OmitAPI, ToObjectType } from "@/db/models/types";

export class CampaignMemberAPIModel
    extends BaseAPIModel
    implements Omit<CampaignMember, "campaign" | "user" | "character">
{
    type: CampaignMemberType;
    campaign: Campaign;
    user: User;
    character: null;

    constructor(campaignMember: CampaignMember) {
        super(campaignMember);
        this.type = campaignMember.type;
        this.campaign = campaignMember.campaign?.name
            ? campaignMember.campaign
            : null!;
        this.user = campaignMember.user?.name ? campaignMember.user : null!;
        this.character = null;
    }

    toObject(
        opts: { currentUser?: User; currentMember?: CampaignMember } = {},
    ) {
        const base = super.toObject();

        return {
            ...base,
            type: this.type,
            campaign: this.campaign
                ? new CampaignAPIModel(this.campaign).toObject(opts)
                : null,
            user: this.user ? new UserAPIModel(this.user).toObject(opts) : null,
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
    campaign: CampaignAPIType;
    user: UserAPIType;
    character: null;

    constructor(campaignMember: CampaignMemberAPIType) {
        super(campaignMember);
        this.type = campaignMember.type;
        this.campaign = campaignMember.campaign
            ? campaignMember.campaign
            : null!;
        this.user = campaignMember.user ? campaignMember.user : null!;
        this.character = null;
    }

    toObject(
        opts: {
            currentUser?: ModelLike<User>;
            currentMember?: OmitAPI<
                ModelLike<CampaignMember>,
                "user" | "campaign"
            >;
        } = {},
    ) {
        const base = super.toObject();

        return {
            ...base,
            type: this.type,
            campaign: this.campaign
                ? new CampaignClientModel(this.campaign).toObject(opts)
                : null,
            user: this.user
                ? new UserClientModel(this.user).toObject(opts)
                : null,
            character: this.character,
        } as BaseClientType & {
            type: CampaignMemberType;
            campaign: CampaignClientType;
            user: UserClientType;
            character: null;
        };
    }
}
export type CampaignMemberClientType = ToObjectType<CampaignMemberClientModel>;
