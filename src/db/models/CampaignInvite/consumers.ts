import { Campaign } from "@/db/models/Campaign";
import {
    CampaignAPIModel,
    CampaignAPIType,
    CampaignClientModel,
} from "@/db/models/Campaign/consumers";
import { CampaignInvite } from "@/db/models/CampaignInvite/index";
import { CampaignMember } from "@/db/models/CampaignMember";
import { User } from "@/db/models/User";
import {
    UserAPIModel,
    UserAPIType,
    UserClientModel,
} from "@/db/models/User/consumers";
import { BaseAPIModel, BaseClientModel } from "@/db/models/baseModel";
import { OmitAPI, ToObjectType } from "@/db/models/types";

export class CampaignInviteAPIModel
    extends BaseAPIModel
    implements CampaignInvite
{
    campaign: Campaign;
    user: User;
    code: string;

    constructor(campaignInvite: CampaignInvite) {
        super(campaignInvite);
        this.campaign = campaignInvite.campaign
            ? campaignInvite.campaign
            : null!;
        this.user = campaignInvite.user ? campaignInvite.user : null!;
        this.code = campaignInvite.code;
    }

    toObject(
        opts: {
            currentUser?: User;
            currentMember?: CampaignMember;
        } = {},
    ) {
        const base = super.toObject();

        return {
            ...base,
            campaign: this.campaign
                ? new CampaignAPIModel(this.campaign).toObject(opts)
                : null,
            user: this.user ? new UserAPIModel(this.user).toObject(opts) : null,
            code: this.code,
        };
    }
}
export type CampaignInviteAPIType = ToObjectType<CampaignInviteAPIModel>;

export class CampaignInviteClientModel
    extends BaseClientModel
    implements OmitAPI<CampaignInviteAPIType, "campaign" | "user">
{
    campaign: CampaignAPIType;
    user: UserAPIType;
    code: string;

    constructor(campaignInvite: CampaignInviteAPIType) {
        super(campaignInvite);
        this.campaign = campaignInvite.campaign
            ? campaignInvite.campaign
            : null!;
        this.user = campaignInvite.user ? campaignInvite.user : null!;
        this.code = campaignInvite.code;
    }

    toObject(
        opts: {
            currentUser?: User;
            currentMember?: CampaignMember;
        } = {},
    ) {
        const base = super.toObject();

        return {
            ...base,
            campaign: this.campaign
                ? new CampaignClientModel(this.campaign).toObject(opts)
                : null,
            user: this.user
                ? new UserClientModel(this.user).toObject(opts)
                : null,
            code: this.code,
        };
    }
}
export type CampaignInviteClientType = ToObjectType<CampaignInviteClientModel>;
