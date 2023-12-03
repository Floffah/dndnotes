import { Schema, model } from "mongoose";

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
        type: Number,
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
            return this.start;
        }

        if (this.start) {
            const nextSession = new Date(this.start);
            nextSession.setDate(nextSession.getDate() + this.repeat);

            return nextSession;
        }

        return new Date(0);
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

export const CampaignModel = model("Campaign", CampaignSchema, undefined, {
    overwriteModels: true,
});
