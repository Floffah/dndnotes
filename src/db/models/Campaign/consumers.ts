import { Campaign } from "@/db/models/Campaign/index";
import { CampaignMember } from "@/db/models/CampaignMember";
import { User } from "@/db/models/User";
import {
    UserAPIModel,
    UserAPIType,
    UserClientModel,
} from "@/db/models/User/consumers";
import { BaseAPIModel, BaseClientModel } from "@/db/types/baseModel";
import { ModelLike, RemoveAPIFields, ToObjectType } from "@/db/types/utils";

export class CampaignAPIModel
    extends BaseAPIModel
    implements Omit<Campaign, "createdBy" | "schedule">
{
    name: string;
    createdBy: User;
    totalSessions: number;

    constructor(campaign: Campaign) {
        super(campaign);
        this.name = campaign.name;

        this.createdBy =
            campaign.createdBy && "db" in campaign.createdBy
                ? campaign.createdBy
                : null!;
        this.totalSessions = campaign.totalSessions;
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
                : null!,
            totalSessions: this.totalSessions,
        };
    }
}

export type CampaignAPIType = ToObjectType<CampaignAPIModel>;

export class CampaignClientModel
    extends BaseClientModel
    implements RemoveAPIFields<CampaignAPIType>
{
    name: string;
    createdBy: UserAPIType;
    totalSessions: number;

    constructor(campaign: CampaignAPIType) {
        super(campaign);
        this.name = campaign.name;
        this.createdBy = campaign.createdBy ? campaign.createdBy : null!;
        this.totalSessions = campaign.totalSessions;
    }

    toObject(
        opts: {
            currentUser?: ModelLike<User>;
            currentMember?: Omit<
                ModelLike<CampaignMember>,
                "campaign" | "user"
            >;
        } = {},
    ) {
        return {
            ...super.toObject(),
            name: this.name,
            createdBy: this.createdBy
                ? new UserClientModel(this.createdBy).toObject(opts)
                : null!,
            totalSessions: this.totalSessions,
        };
    }
}

export type CampaignClientType = ToObjectType<CampaignClientModel>;
