import { Campaign } from "@/db/models/Campaign/index";
import { CampaignMember } from "@/db/models/CampaignMember";
import { User } from "@/db/models/User";
import {
    UserAPIModel,
    UserAPIType,
    UserClientModel,
} from "@/db/models/User/consumers";
import {
    BaseAPIModel,
    BaseAPIType,
    BaseClientModel,
} from "@/db/models/baseModel";
import { ModelLike, OmitAPI, ToObjectType } from "@/db/models/types";

export class CampaignAPIModel
    extends BaseAPIModel
    implements Omit<Campaign, "createdBy" | "schedule">
{
    name: string;
    createdBy: User | null;
    schedule: {
        manual?: boolean;
        start?: Date;
        repeat?: number;
        dayOfWeek?: number[];

        nextSession: Date;
    };

    constructor(campaign: Campaign) {
        super(campaign);
        this.name = campaign.name;
        this.createdBy =
            campaign.createdBy && campaign.createdBy.name
                ? campaign.createdBy
                : null;

        this.schedule = {
            manual: campaign.schedule?.manual,
            start: campaign.schedule?.start,
            repeat: campaign.schedule?.repeat,
            dayOfWeek: campaign.schedule?.dayOfWeek,
            nextSession: campaign.schedule.nextSession,
        };
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
            schedule: {
                manual: this.schedule.manual,
                start: this.schedule.start?.toISOString(),
                repeat: this.schedule.repeat,
                dayOfWeek: this.schedule.dayOfWeek,
                nextSession: this.schedule.nextSession.toISOString(),
            },
        } as BaseAPIType & {
            name: string;
            createdBy: UserAPIType | null;
            schedule: {
                manual?: boolean;
                start?: string;
                repeat?: number;
                dayOfWeek?: number[];

                nextSession: string;
            };
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
    schedule: {
        manual?: boolean;
        start?: Date;
        repeat?: number;
        dayOfWeek?: number[];

        nextSession: Date;
    };

    constructor(campaign: CampaignAPIType) {
        super(campaign);
        this.name = campaign.name;
        this.createdBy = campaign.createdBy ? campaign.createdBy : null;
        this.schedule = {
            manual: campaign.schedule?.manual,
            start: campaign.schedule?.start
                ? new Date(campaign.schedule.start)
                : undefined,
            repeat: campaign.schedule?.repeat,
            dayOfWeek: campaign.schedule?.dayOfWeek,
            nextSession: new Date(campaign.schedule.nextSession),
        };
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
            schedule: {
                manual: this.schedule.manual,
                start: this.schedule.start,
                repeat: this.schedule.repeat,
                dayOfWeek: this.schedule.dayOfWeek,
                nextSession: this.schedule.nextSession,
            },
        };
    }
}

export type CampaignClientType = ToObjectType<CampaignClientModel>;
