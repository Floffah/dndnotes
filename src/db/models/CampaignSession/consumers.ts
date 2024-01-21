import { CampaignSessionType } from "@/db/enums/CampaignSessionType";
import { Campaign } from "@/db/models/Campaign";
import {
    CampaignAPIModel,
    CampaignAPIType,
    CampaignClientModel,
} from "@/db/models/Campaign/consumers";
import { CampaignMember } from "@/db/models/CampaignMember";
import { CampaignSession } from "@/db/models/CampaignSession/index";
import { CampaignSessionSchedule } from "@/db/models/CampaignSessionSchedule";
import {
    CampaignSessionScheduleAPIModel,
    CampaignSessionScheduleAPIType,
    CampaignSessionScheduleClientModel,
} from "@/db/models/CampaignSessionSchedule/consumers";
import { User } from "@/db/models/User";
import { BaseAPIModel, BaseClientModel } from "@/db/types/baseModel";
import { ModelLike, RemoveAPIFields, ToObjectType } from "@/db/types/utils";

export class CampaignSessionAPIModel
    extends BaseAPIModel
    implements CampaignSession
{
    name: string;
    type: CampaignSessionType;
    campaign: Campaign;
    startedAt: Date;
    schedule?: CampaignSessionSchedule;

    constructor(campaignSession: CampaignSession) {
        super(campaignSession);

        this.name = campaignSession.name;
        this.type = campaignSession.type;
        this.campaign =
            campaignSession.campaign && "db" in campaignSession.campaign
                ? campaignSession.campaign
                : null!;
        this.startedAt = campaignSession.startedAt;
        this.schedule =
            campaignSession.schedule && "db" in campaignSession.schedule
                ? campaignSession.schedule
                : null!;
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
            name: this.name,
            type: this.type,
            campaign: this.campaign
                ? new CampaignAPIModel(this.campaign).toObject(opts)
                : null,
            startedAt: this.startedAt,
            schedule: this.schedule
                ? new CampaignSessionScheduleAPIModel(this.schedule).toObject(
                      opts,
                  )
                : null,
        };
    }
}
export type CampaignSessionAPIType = ToObjectType<CampaignSessionAPIModel>;

export class CampaignSessionClientModel
    extends BaseClientModel
    implements RemoveAPIFields<CampaignSessionAPIType>
{
    name: string;
    type: CampaignSessionType;
    campaign: CampaignAPIType;
    startedAt: Date;
    schedule?: CampaignSessionScheduleAPIType;

    constructor(campaignSession: CampaignSessionAPIType) {
        super(campaignSession);

        this.name = campaignSession.name;
        this.type = campaignSession.type;
        this.campaign = campaignSession.campaign
            ? campaignSession.campaign
            : null!;
        this.startedAt = campaignSession.startedAt;
        this.schedule = campaignSession.schedule
            ? campaignSession.schedule
            : null!;
    }

    toObject(
        opts: {
            currentUser?: ModelLike<User>;
            currentMember?: ModelLike<CampaignMember>;
        } = {},
    ) {
        return {
            ...super.toObject(),
            name: this.name,
            type: this.type,
            campaign: this.campaign
                ? new CampaignClientModel(this.campaign).toObject(opts)
                : null,
            startedAt: this.startedAt,
            schedule: this.schedule
                ? new CampaignSessionScheduleClientModel(
                      this.schedule,
                  ).toObject(opts)
                : null,
        };
    }
}
