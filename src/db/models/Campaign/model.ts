import { addDays, addMonths } from "date-fns";
import { Schema, model } from "mongoose";

import { RepeatInterval } from "@/db/enums/RepeatInterval";
import { Campaign } from "@/db/models/Campaign/index";
import { UserModel } from "@/db/models/User/model";
import { decorateSchema } from "@/db/models/decorateSchema";

const CampaignSessionScheduleSchema = new Schema<Campaign["schedule"]>({
    manual: {
        type: Boolean,
        required: false,
    },
    start: {
        type: Date,
        required: false,
    },
    repeat: {
        type: String,
        enum: RepeatInterval,
        required: false,
    },
    length: {
        type: Number,
        required: true,
        default: 2 * 60 * 60 * 1000,
    },
});

CampaignSessionScheduleSchema.virtual("nextSession")
    .get(function () {
        if (this.manual) {
            if (!this.start || this.start.getTime() < Date.now()) {
                return null;
            }

            return this.start;
        }

        if (this.start) {
            let sessionsSinceStart = 0;

            switch (this.repeat) {
                case RepeatInterval.WEEKLY:
                    sessionsSinceStart =
                        Math.floor(
                            (Date.now() - this.start.getTime()) /
                                (7 * 24 * 60 * 60 * 1000),
                        ) ?? 0;
                    break;
                case RepeatInterval.FORTNIGHTLY:
                    sessionsSinceStart =
                        Math.floor(
                            (Date.now() - this.start.getTime()) /
                                (14 * 24 * 60 * 60 * 1000),
                        ) ?? 0;
                    break;
                case RepeatInterval.MONTHLY:
                    sessionsSinceStart =
                        Math.floor(
                            (Date.now() - this.start.getTime()) /
                                (30 * 24 * 60 * 60 * 1000),
                        ) ?? 0;
                    break;
            }

            let nextSession = new Date(this.start);

            switch (this.repeat) {
                case RepeatInterval.WEEKLY:
                    nextSession = addDays(nextSession, sessionsSinceStart * 7);
                    break;
                case RepeatInterval.FORTNIGHTLY:
                    nextSession = addDays(nextSession, sessionsSinceStart * 14);
                    break;
                case RepeatInterval.MONTHLY:
                    nextSession = addMonths(nextSession, sessionsSinceStart);
                    break;
            }

            // 'current session' state - if there is a session scheduled within the previous 2 hours, return that
            if (
                this.length &&
                Date.now() > nextSession.getTime() &&
                Date.now() - nextSession.getTime() < this.length
            ) {
                return nextSession;
            }

            // but otherwise return the next session
            switch (this.repeat) {
                case RepeatInterval.WEEKLY:
                    nextSession = addDays(nextSession, 7);
                    break;
                case RepeatInterval.FORTNIGHTLY:
                    nextSession = addDays(nextSession, 14);
                    break;
                case RepeatInterval.MONTHLY:
                    nextSession = addMonths(nextSession, 1);
                    break;
            }

            // unless the schedule state is invalid - in which case return null
            if (Date.now() > nextSession.getTime()) {
                return null;
            }

            return nextSession;
        }

        return null;
    })
    .set(function (nextSession: Date) {
        if (this.manual) {
            this.set({
                start: nextSession,
            });
        }
    });

export const CampaignSchema = decorateSchema(
    new Schema<Campaign>({
        name: {
            type: String,
            required: true,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: UserModel,
            required: true,
        },
        schedule: {
            type: CampaignSessionScheduleSchema,
            required: true,
            default: {},
        },
        totalSessions: {
            type: Number,
            required: true,
            default: 0,
        },
    }),
);

export const CampaignModel = model("Campaign", CampaignSchema, undefined, {
    overwriteModels: true,
});
