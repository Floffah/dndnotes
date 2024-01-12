import { RepeatInterval } from "@/db/enums/RepeatInterval";
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
        repeat?: RepeatInterval;

        nextSession?: Date;
    };
    totalSessions: number;

    constructor(campaign: Campaign) {
        super(campaign);
        this.name = campaign.name;

        this.createdBy =
            campaign.createdBy && "db" in campaign.createdBy
                ? campaign.createdBy
                : null;
        this.schedule = {
            manual: campaign.schedule?.manual,
            start: campaign.schedule?.start,
            repeat: campaign.schedule?.repeat,
            nextSession: campaign.schedule?.nextSession,
        };
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
                : null,
            schedule: {
                manual: this.schedule.manual,
                start: this.schedule.start?.toISOString(),
                repeat: this.schedule.repeat,
                nextSession: this.schedule.nextSession?.toISOString(),
            },
            totalSessions: this.totalSessions,
        } as BaseAPIType & {
            name: string;
            createdBy: UserAPIType | null;
            schedule: {
                manual?: boolean;
                start?: string;
                repeat?: RepeatInterval;

                nextSession: string;
            };
            totalSessions: number;
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
        repeat?: RepeatInterval;

        nextSession?: Date;
    };
    totalSessions: number;

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
            nextSession: campaign.schedule?.nextSession
                ? new Date(campaign.schedule.nextSession)
                : undefined,
        };
        this.totalSessions = campaign.totalSessions;
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
            createdBy: this.createdBy
                ? new UserClientModel(this.createdBy).toObject(opts)
                : null,
            schedule: {
                manual: this.schedule.manual,
                start: this.schedule.start,
                repeat: this.schedule.repeat,
                nextSession: this.schedule.nextSession,
            },
            totalSessions: this.totalSessions,
        };
    }
}

export type CampaignClientType = ToObjectType<CampaignClientModel>;
