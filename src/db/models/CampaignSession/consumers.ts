import { CampaignSessionStartType } from "@/db/enums/CampaignSessionStartType";
import { CampaignSessionType } from "@/db/enums/CampaignSessionType";
import { Campaign } from "@/db/models/Campaign";
import {
    CampaignAPIModel,
    CampaignAPIType,
    CampaignClientModel,
} from "@/db/models/Campaign/consumers";
import { CampaignMember } from "@/db/models/CampaignMember";
import {
    CampaignMemberAPIModel,
    CampaignMemberAPIType,
    CampaignMemberClientModel,
} from "@/db/models/CampaignMember/consumers";
import { CampaignSession } from "@/db/models/CampaignSession/index";
import { User } from "@/db/models/User";
import { BaseAPIModel, BaseClientModel } from "@/db/models/baseModel";
import { ModelLike, RemoveAPIFields, ToObjectType } from "@/db/models/types";

export class CampaignSessionAPIModel
    extends BaseAPIModel
    implements CampaignSession
{
    campaign: Campaign;
    name: string;
    startType: CampaignSessionStartType;
    startedAt: Date;
    startedBy: CampaignMember;
    type: CampaignSessionType;

    constructor(campaignSession: CampaignSession) {
        super(campaignSession);
        this.campaign =
            campaignSession.campaign && "db" in campaignSession.campaign
                ? campaignSession.campaign
                : null!;
        this.name = campaignSession.name;
        this.startType = campaignSession.startType;
        this.startedAt = campaignSession.startedAt;
        this.startedBy =
            campaignSession.startedBy && "db" in campaignSession.startedBy
                ? campaignSession.startedBy
                : null!;
        this.type = campaignSession.type;
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
            name: this.name,
            startType: this.startType,
            startedAt: this.startedAt,
            startedBy: this.startedBy
                ? new CampaignMemberAPIModel(this.startedBy).toObject(opts)
                : null,
            type: this.type,
        };
    }
}
export type CampaignSessionAPIType = ToObjectType<CampaignSessionAPIModel>;

export class CampaignSessionClientModel
    extends BaseClientModel
    implements RemoveAPIFields<CampaignSessionAPIType>
{
    campaign: CampaignAPIType;
    name: string;
    startType: CampaignSessionStartType;
    startedAt: Date;
    startedBy: CampaignMemberAPIType;
    type: CampaignSessionType;

    constructor(campaignSession: CampaignSessionAPIType) {
        super(campaignSession);
        this.campaign = campaignSession.campaign
            ? campaignSession.campaign
            : null!;
        this.name = campaignSession.name;
        this.startType = campaignSession.startType;
        this.startedAt = campaignSession.startedAt;
        this.startedBy = campaignSession.startedBy
            ? campaignSession.startedBy
            : null!;
        this.type = campaignSession.type;
    }

    toObject(
        opts: {
            currentUser?: ModelLike<User>;
            currentMember?: ModelLike<CampaignMember>;
        } = {},
    ) {
        return {
            ...super.toObject(),
            campaign: this.campaign
                ? new CampaignClientModel(this.campaign).toObject(opts)
                : null,
            name: this.name,
            startType: this.startType,
            startedAt: this.startedAt,
            startedBy: this.startedBy
                ? new CampaignMemberClientModel(this.startedBy).toObject(opts)
                : null,
            type: this.type,
        };
    }
}
