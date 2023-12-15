import { Document, Schema, model } from "mongoose";

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
    dayOfWeek: {
        type: [Number],
        required: false,
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
            const sessionsHeld = (
                this.$parent() as Document<unknown, {}, Campaign> & Campaign
            ).sessionsHeldSinceScheduleStart;

            const nextSession = new Date(this.start);
            switch (this.repeat) {
                case RepeatInterval.WEEKLY:
                    nextSession.setDate(
                        nextSession.getDate() + sessionsHeld * 7,
                    );
                    break;
                case RepeatInterval.FORTNIGHTLY:
                    nextSession.setDate(
                        nextSession.getDate() + sessionsHeld * 14,
                    );
                    break;
                case RepeatInterval.MONTHLY:
                    nextSession.setMonth(nextSession.getMonth() + sessionsHeld);
                    break;
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
    }),
);

CampaignSchema.virtual("totalSessionsHeld").get(function () {
    return 0;
});

CampaignSchema.virtual("sessionsHeldSinceScheduleStart").get(function () {
    return 0;
});

export const CampaignModel = model("Campaign", CampaignSchema, undefined, {
    overwriteModels: true,
});
