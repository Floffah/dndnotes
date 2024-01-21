import { CampaignSessionType } from "@/db/enums/CampaignSessionType";
import { RepeatInterval } from "@/db/enums/RepeatInterval";
import { Campaign } from "@/db/models/Campaign";
import {
    CampaignAPIModel,
    CampaignAPIType,
    CampaignClientModel,
} from "@/db/models/Campaign/consumers";
import { CampaignMember } from "@/db/models/CampaignMember";
import { CampaignSession } from "@/db/models/CampaignSession";
import {
    CampaignSessionAPIModel,
    CampaignSessionAPIType,
    CampaignSessionClientModel,
} from "@/db/models/CampaignSession/consumers";
import { CampaignSessionSchedule } from "@/db/models/CampaignSessionSchedule/index";
import { User } from "@/db/models/User";
import { BaseAPIModel, BaseClientModel } from "@/db/types/baseModel";
import { ModelLike, OmitAPI, ToObjectType } from "@/db/types/utils";

export class CampaignSessionScheduleAPIModel
    extends BaseAPIModel
    implements CampaignSessionSchedule
{
    name: string;
    type: CampaignSessionType;
    campaign: Campaign;
    sessions: CampaignSession[];

    firstSessionAt: Date;
    repeat?: RepeatInterval;
    length: number;
    nextSessionAt: Date;

    constructor(campaignSessionSchedule: CampaignSessionSchedule) {
        super(campaignSessionSchedule);

        this.name = campaignSessionSchedule.name;
        this.type = campaignSessionSchedule.type;
        this.campaign =
            "db" in campaignSessionSchedule.campaign
                ? campaignSessionSchedule.campaign
                : null!;
        this.sessions = campaignSessionSchedule.sessions?.some(
            (session) => "db" in session,
        )
            ? campaignSessionSchedule.sessions
            : [];
        this.firstSessionAt = campaignSessionSchedule.firstSessionAt;
        this.repeat = campaignSessionSchedule.repeat;
        this.length = campaignSessionSchedule.length;
        this.nextSessionAt = campaignSessionSchedule.nextSessionAt;
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
            sessions: this.sessions.map((session) =>
                new CampaignSessionAPIModel(session).toObject(opts),
            ),
            firstSessionAt: this.firstSessionAt,
            repeat: this.repeat,
            length: this.length,
            nextSessionAt: this.nextSessionAt,
        };
    }
}
export type CampaignSessionScheduleAPIType =
    ToObjectType<CampaignSessionScheduleAPIModel>;

export class CampaignSessionScheduleClientModel
    extends BaseClientModel
    implements
        OmitAPI<
            CampaignSessionScheduleAPIType,
            "campaign" | "nextSessionAt" | "firstSessionAt" | "repeat"
        >
{
    campaign: CampaignAPIType;
    name: Date;
    type: CampaignSessionType;
    sessions: CampaignSessionAPIType[];
    firstSessionAt: Date;
    repeat?: RepeatInterval;
    length: Date;
    nextSessionAt: Date;

    constructor(campaignSessionSchedule: CampaignSessionScheduleAPIType) {
        super(campaignSessionSchedule);

        this.name = campaignSessionSchedule.name;
        this.type = campaignSessionSchedule.type;
        this.campaign = campaignSessionSchedule.campaign as CampaignAPIType;
        this.sessions = campaignSessionSchedule.sessions;
        this.firstSessionAt = new Date(campaignSessionSchedule.firstSessionAt);
        this.repeat = campaignSessionSchedule.repeat;
        this.length = campaignSessionSchedule.length;
        this.nextSessionAt = new Date(campaignSessionSchedule.nextSessionAt);
    }

    toObject(
        opts: {
            currentUser?: ModelLike<User>;
            currentMember?: ModelLike<CampaignMember>;
        } = {},
    ) {
        const base = super.toObject();

        return {
            ...base,
            name: this.name,
            type: this.type,
            campaign: this.campaign
                ? new CampaignClientModel(this.campaign).toObject(opts)
                : null,
            sessions: this.sessions.map((session) =>
                new CampaignSessionClientModel(session).toObject(opts),
            ),
            firstSessionAt: this.firstSessionAt,
            repeat: this.repeat,
            length: this.length,
            nextSessionAt: this.nextSessionAt,
        };
    }
}
export type CampaignSessionScheduleClientType =
    ToObjectType<CampaignSessionScheduleClientModel>;
